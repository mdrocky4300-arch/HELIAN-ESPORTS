import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTournamentByIdFromDb } from '@/lib/tournament-store';

function generateId(prefix: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix + '-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const ALLOWED_PATTERN = /^[A-Za-z0-9_ ]+$/;

function validateText(value: string, fieldName: string, required = true): string | null {
  if (!value || !value.trim()) {
    return required ? `${fieldName} is required.` : null;
  }
  if (!ALLOWED_PATTERN.test(value.trim())) {
    return `${fieldName}: Only letters, numbers, underscores, and spaces are allowed.`;
  }
  return null;
}

function validateWhatsApp(value: string): string | null {
  if (!value || !value.trim()) return 'Captain WhatsApp Number is required.';
  const cleaned = value.trim().replace(/\s+/g, '');
  if (!/^[\d+\-()]+$/.test(cleaned) || cleaned.replace(/\D/g, '').length < 10) {
    return 'Enter a valid WhatsApp number (minimum 10 digits).';
  }
  return null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: tournamentId } = await params;

  let body: Record<string, any> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 });
  }

  const {
    userId,
    userName,
    userEmail,
    userWalletBalance,
    squadName,
    iglName,
    player1Name,
    player2Name,
    player3Name,
    player4Name,
    backupPlayerName,
    captainWhatsApp,
  } = body;

  // Field validation
  const errors: Record<string, string> = {};

  const squadNameErr = validateText(squadName, 'Squad Name');
  if (squadNameErr) errors.squadName = squadNameErr;

  const iglNameErr = validateText(iglName, 'IGL Name');
  if (iglNameErr) errors.iglName = iglNameErr;

  const p1NameErr = validateText(player1Name, 'Player 1 Name');
  if (p1NameErr) errors.player1Name = p1NameErr;

  const p2NameErr = validateText(player2Name, 'Player 2 Name');
  if (p2NameErr) errors.player2Name = p2NameErr;

  const p3NameErr = validateText(player3Name, 'Player 3 Name');
  if (p3NameErr) errors.player3Name = p3NameErr;

  const p4NameErr = validateText(player4Name, 'Player 4 Name');
  if (p4NameErr) errors.player4Name = p4NameErr;


  const whatsappErr = validateWhatsApp(captainWhatsApp);
  if (whatsappErr) errors.captainWhatsApp = whatsappErr;

  // Backup player validation (optional but must be valid format if provided)
  if (backupPlayerName && backupPlayerName.trim()) {
    const backupNameErr = validateText(backupPlayerName, 'Backup Player Name', false);
    if (backupNameErr) errors.backupPlayerName = backupNameErr;
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ message: 'Validation failed.', errors }, { status: 422 });
  }


  try {
    // Load tournament
    const tournament = await getTournamentByIdFromDb(tournamentId);
    if (!tournament) {
      return NextResponse.json({ message: 'Tournament not found.' }, { status: 404 });
    }
    if (!tournament.registrationOpen) {
      return NextResponse.json({ message: 'Registration is closed for this tournament.' }, { status: 400 });
    }
    if (tournament.registeredCount >= tournament.maxTeams) {
      return NextResponse.json({ message: 'This tournament is full. No more slots available.' }, { status: 400 });
    }

    // Ensure user exists in DB, auto-create if not (syncing from localStorage-based frontend)
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          name: userName || 'Player',
          email: userEmail || `${userId}@helian.gg`,
          walletBalance: typeof userWalletBalance === 'number' ? userWalletBalance : 0,
          referralCode: `REF_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        },
      });
    } else if (typeof userWalletBalance === 'number' && user.walletBalance < userWalletBalance) {
      // Sync wallet balance if frontend reports a higher value (sign-up bonus or deposit added on frontend)
      await prisma.user.update({
        where: { id: userId },
        data: { walletBalance: userWalletBalance },
      });
      user = { ...user, walletBalance: userWalletBalance };
    }

    // Check wallet balance - must have enough to register
    if (user.walletBalance < tournament.entryFee) {
      return NextResponse.json({
        message: `Wallet balance insufficient! You need BDT ${tournament.entryFee} to register, but your wallet only has BDT ${user.walletBalance}. Please add money to your wallet first.`,
        code: 'INSUFFICIENT_BALANCE',
        required: tournament.entryFee,
        available: user.walletBalance,
      }, { status: 400 });
    }


    // Check duplicate squad name in tournament
    const existingSquad = await prisma.participant.findFirst({
      where: { tournamentId, squadName: squadName.trim() },
    });
    if (existingSquad) {
      return NextResponse.json({ message: 'Validation failed.', errors: { squadName: 'This squad name is already registered in this tournament. Choose a different name.' } }, { status: 422 });
    }

    // Generate IDs
    const registrationId = generateId('REG');
    const teamId = generateId('TEAM');
    const trxId = `WAL_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Execute all DB changes in one transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct wallet balance immediately
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: tournament.entryFee } },
      });

      // 2. Create participation record (auto-verified)
      const participant = await tx.participant.create({
        data: {
          tournamentId,
          userId,
          status: 'VERIFIED',
          registrationId,
          squadName: squadName.trim(),
          iglName: iglName.trim(),
          captainWhatsApp: captainWhatsApp.trim(),
          player1Name: player1Name.trim(),
          player2Name: player2Name.trim(),
          player3Name: player3Name.trim(),
          player4Name: player4Name.trim(),
          backupPlayerName: backupPlayerName?.trim() || null,
        },
      });

      // 3. Create wallet payment record (completed)
      await tx.payment.create({
        data: {
          userId,
          tournamentId,
          method: 'WALLET',
          amount: tournament.entryFee,
          trxId,
          status: 'VERIFIED',
          notes: `Squad registration: ${squadName.trim()} | ${registrationId}`,
        },
      });

      // 4. Increment registered count
      await tx.tournament.update({
        where: { id: tournamentId },
        data: { registeredCount: { increment: 1 } },
      });

      return { participant, updatedUser };
    });

    return NextResponse.json({
      message: 'Registration successful! BDT ' + tournament.entryFee + ' has been deducted from your wallet.',
      registrationId,
      teamId,
      squadName: squadName.trim(),
      tournamentTitle: tournament.title,
      entryFee: tournament.entryFee,
      remainingBalance: result.updatedUser.walletBalance,
      status: 'VERIFIED',
    }, { status: 201 });

  } catch (error: any) {
    console.error('[POST /api/tournaments/[id]/register]', error?.message || error);
    return NextResponse.json({ message: error?.message || 'Registration failed. Please try again.' }, { status: 500 });
  }
}
