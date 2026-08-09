import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSession, requireAdminRole } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  return verifyAdminSession(token);
}

export async function GET() {
  const session = await getSession();
  if (!requireAdminRole(session, ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'])) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const registrations = await prisma.participant.findMany({
      orderBy: { joinedAt: 'desc' },
      include: {
        tournament: { select: { id: true, title: true, entryFee: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const result = registrations.map((reg) => ({
      id: reg.id,
      registrationId: reg.registrationId,
      teamId: reg.teamId,
      tournamentId: reg.tournamentId,
      tournamentTitle: reg.tournament?.title || '',
      entryFee: reg.tournament?.entryFee || 0,
      userId: reg.userId,
      userName: reg.user?.name || '',
      userEmail: reg.user?.email || '',
      squadName: reg.squadName || '',
      iglName: reg.iglName || '',
      captainWhatsApp: reg.captainWhatsApp || '',
      player1Name: reg.player1Name || '',
      player2Name: reg.player2Name || '',
      player3Name: reg.player3Name || '',
      player4Name: reg.player4Name || '',
      backupPlayerName: reg.backupPlayerName || '',
      status: reg.status,
      joinedAt: reg.joinedAt.toISOString(),
    }));

    return NextResponse.json({ registrations: result });
  } catch (error: any) {
    console.error('[GET /api/admin/registrations]', error?.message);
    return NextResponse.json({ message: 'Failed to load registrations.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!requireAdminRole(session, ['SUPER_ADMIN', 'ADMIN'])) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  let body: Record<string, any> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 });
  }

  const { registrationId, action } = body; // action: 'APPROVE' | 'REJECT'
  if (!registrationId || !['APPROVE', 'REJECT'].includes(action)) {
    return NextResponse.json({ message: 'Invalid request: registrationId and action (APPROVE|REJECT) are required.' }, { status: 400 });
  }

  try {
    const participant = await prisma.participant.findFirst({
      where: { id: registrationId },
      include: { tournament: { select: { entryFee: true, title: true } } },
    });

    if (!participant) {
      return NextResponse.json({ message: 'Registration not found.' }, { status: 404 });
    }

    if (participant.status !== 'PENDING') {
      return NextResponse.json({ message: `Registration is already ${participant.status}.` }, { status: 409 });
    }

    const newStatus = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED';

    await prisma.$transaction(async (tx) => {
      // 1. Update participant status
      await tx.participant.update({
        where: { id: registrationId },
        data: { status: newStatus },
      });

      // 2. Update payment record status
      await tx.payment.updateMany({
        where: {
          userId: participant.userId,
          tournamentId: participant.tournamentId,
          method: 'WALLET',
          status: 'PENDING',
        },
        data: { status: newStatus },
      });

      if (action === 'APPROVE' && participant.tournament?.entryFee) {
        // 3a. APPROVE: Deduct wallet balance (was held until now)
        await tx.user.update({
          where: { id: participant.userId },
          data: { walletBalance: { decrement: participant.tournament.entryFee } },
        });

        // 3b. Increment tournament registered count
        await tx.tournament.update({
          where: { id: participant.tournamentId },
          data: { registeredCount: { increment: 1 } },
        });
      }
      // REJECT: No wallet change needed — money was never deducted on registration
    });

    return NextResponse.json({
      ok: true,
      message: action === 'APPROVE'
        ? 'Registration approved successfully.'
        : `Registration rejected. ৳${participant.tournament?.entryFee || 0} refunded to player's wallet.`,
    });
  } catch (error: any) {
    console.error('[PATCH /api/admin/registrations]', error?.message);
    return NextResponse.json({ message: error?.message || 'Failed to update registration.' }, { status: 500 });
  }
}
