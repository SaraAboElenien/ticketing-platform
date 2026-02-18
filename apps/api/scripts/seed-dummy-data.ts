/**
 * Seed script to populate the database with dummy Events and Bookings.
 * 
 * Usage:
 *   npm run seed --workspace=apps/api
 * 
 * Or directly:
 *   ts-node apps/api/scripts/seed-dummy-data.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { Event } from '../src/core/models/Event.model';
import { Booking } from '../src/core/models/Booking.model';
import { User } from '../src/core/models/User.model';
import { EventStatus, BookingStatus } from '@ticketing-platform/shared';
import { config } from '../src/config';

// ── Helper: Generate unique ticket number ──────────────────────────────
function generateTicketNumber(eventId: string, index: number): string {
  const prefix = eventId.slice(-6).toUpperCase();
  return `TKT-${prefix}-${String(index + 1).padStart(4, '0')}`;
}

// ── Helper: Generate UUID for idempotency key ────────────────────────────
function generateIdempotencyKey(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...\n');

    // Connect to MongoDB
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB\n');

    // ── Step 1: Get or create test users ────────────────────────────────
    console.log('📋 Step 1: Ensuring test users exist...');
    
    // Find existing users or create test users
    let testUser1 = await User.findOne({ email: 'testuser1@example.com' });
    let testUser2 = await User.findOne({ email: 'testuser2@example.com' });
    let adminUser = await User.findOne({ email: 'admin@example.com' });

    // Hash password once for all users
    const hashedPassword = await bcrypt.hash('Password123', 10);

    if (!testUser1) {
      testUser1 = await User.create({
        email: 'testuser1@example.com',
        password: hashedPassword,
        name: 'Test User One',
        role: 'user',
        provider: 'local',
        isEmailVerified: true,
      });
      console.log('  ✓ Created testuser1@example.com');
    } else {
      console.log('  ✓ Found existing testuser1@example.com');
    }

    if (!testUser2) {
      testUser2 = await User.create({
        email: 'testuser2@example.com',
        password: hashedPassword,
        name: 'Test User Two',
        role: 'user',
        provider: 'local',
        isEmailVerified: true,
      });
      console.log('  ✓ Created testuser2@example.com');
    } else {
      console.log('  ✓ Found existing testuser2@example.com');
    }

    if (!adminUser) {
      adminUser = await User.create({
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        provider: 'local',
        isEmailVerified: true,
      });
      console.log('  ✓ Created admin@example.com');
    } else {
      console.log('  ✓ Found existing admin@example.com');
    }

    // ── Step 2: Clear existing events and bookings (optional) ───────────
    console.log('\n📋 Step 2: Clearing existing dummy data...');
    await Event.deleteMany({ name: { $regex: /^(Summer|Winter|Spring|Jazz|Rock|Tech|Comedy)/ } });
    await Booking.deleteMany({});
    console.log('  ✓ Cleared old dummy data\n');

    // ── Step 3: Create dummy events ─────────────────────────────────────
    console.log('📋 Step 3: Creating dummy events...');

    const now = new Date();
    const events = [
      // Published events (available)
      {
        name: 'Summer Music Festival 2026',
        date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        venue: 'Central Park',
        totalTickets: 5000,
        availableTickets: 3500, // 70% available
        price: 75.00,
        status: EventStatus.PUBLISHED,
      },
      {
        name: 'Jazz Night at Blue Note',
        date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        venue: 'Blue Note Jazz Club',
        totalTickets: 200,
        availableTickets: 45, // 22.5% available (limited)
        price: 50.00,
        status: EventStatus.PUBLISHED,
      },
      {
        name: 'Tech Conference 2026',
        date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        venue: 'Convention Center',
        totalTickets: 1000,
        availableTickets: 800, // 80% available
        price: 299.00,
        status: EventStatus.PUBLISHED,
      },
      {
        name: 'Rock Concert: The Legends',
        date: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        venue: 'Madison Square Garden',
        totalTickets: 20000,
        availableTickets: 500, // 2.5% available (almost sold out)
        price: 150.00,
        status: EventStatus.PUBLISHED,
      },
      {
        name: 'Comedy Show: Stand-Up Night',
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        venue: 'Comedy Cellar',
        totalTickets: 150,
        availableTickets: 0, // Sold out
        price: 35.00,
        status: EventStatus.PUBLISHED,
      },
      {
        name: 'Winter Wonderland Market',
        date: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        venue: 'Downtown Plaza',
        totalTickets: 500,
        availableTickets: 450, // 90% available
        price: 25.00,
        status: EventStatus.PUBLISHED,
      },
      // Draft events
      {
        name: 'Spring Art Exhibition',
        date: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
        venue: 'Metropolitan Museum',
        totalTickets: 300,
        availableTickets: 300,
        price: 40.00,
        status: EventStatus.DRAFT,
      },
      {
        name: 'Food & Wine Festival',
        date: new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000), // 75 days from now
        venue: 'Waterfront Park',
        totalTickets: 800,
        availableTickets: 800,
        price: 85.00,
        status: EventStatus.DRAFT,
      },
      // Cancelled event
      {
        name: 'Cancelled: Outdoor Movie Night',
        date: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        venue: 'Riverside Park',
        totalTickets: 300,
        availableTickets: 300,
        price: 20.00,
        status: EventStatus.CANCELLED,
      },
      // Completed event (past date)
      {
        name: 'New Year Celebration 2025',
        date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        venue: 'Times Square',
        totalTickets: 10000,
        availableTickets: 0,
        price: 100.00,
        status: EventStatus.COMPLETED,
      },
    ];

    const createdEvents = await Event.insertMany(events);
    console.log(`  ✓ Created ${createdEvents.length} events\n`);

    // ── Step 4: Create dummy bookings ───────────────────────────────────
    console.log('📋 Step 4: Creating dummy bookings...');

    const bookings = [];

    // Bookings for "Summer Music Festival" (published, available)
    const summerFestival = createdEvents.find((e) => e.name === 'Summer Music Festival 2026');
    if (summerFestival) {
      bookings.push(
        {
          userId: testUser1._id,
          eventId: summerFestival._id,
          ticketNumber: generateTicketNumber(summerFestival._id.toString(), 0),
          bookingDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          status: BookingStatus.CONFIRMED,
          idempotencyKey: generateIdempotencyKey(),
        },
        {
          userId: testUser2._id,
          eventId: summerFestival._id,
          ticketNumber: generateTicketNumber(summerFestival._id.toString(), 1),
          bookingDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          status: BookingStatus.CONFIRMED,
          idempotencyKey: generateIdempotencyKey(),
        }
      );
    }

    // Bookings for "Jazz Night" (limited availability)
    const jazzNight = createdEvents.find((e) => e.name === 'Jazz Night at Blue Note');
    if (jazzNight) {
      bookings.push(
        {
          userId: testUser1._id,
          eventId: jazzNight._id,
          ticketNumber: generateTicketNumber(jazzNight._id.toString(), 0),
          bookingDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          status: BookingStatus.CONFIRMED,
          idempotencyKey: generateIdempotencyKey(),
        },
        {
          userId: testUser2._id,
          eventId: jazzNight._id,
          ticketNumber: generateTicketNumber(jazzNight._id.toString(), 1),
          bookingDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          status: BookingStatus.CANCELLED,
          cancelledAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
          cancellationReason: 'Changed plans',
          idempotencyKey: generateIdempotencyKey(),
        }
      );
    }

    // Bookings for "Tech Conference"
    const techConference = createdEvents.find((e) => e.name === 'Tech Conference 2026');
    if (techConference) {
      bookings.push(
        {
          userId: testUser1._id,
          eventId: techConference._id,
          ticketNumber: generateTicketNumber(techConference._id.toString(), 0),
          bookingDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          status: BookingStatus.CONFIRMED,
          idempotencyKey: generateIdempotencyKey(),
        },
        {
          userId: adminUser._id,
          eventId: techConference._id,
          ticketNumber: generateTicketNumber(techConference._id.toString(), 1),
          bookingDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
          status: BookingStatus.CONFIRMED,
          idempotencyKey: generateIdempotencyKey(),
        }
      );
    }

    // Bookings for "Rock Concert" (almost sold out)
    const rockConcert = createdEvents.find((e) => e.name === 'Rock Concert: The Legends');
    if (rockConcert) {
      bookings.push(
        {
          userId: testUser2._id,
          eventId: rockConcert._id,
          ticketNumber: generateTicketNumber(rockConcert._id.toString(), 0),
          bookingDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          status: BookingStatus.CONFIRMED,
          idempotencyKey: generateIdempotencyKey(),
        }
      );
    }

    // Bookings for "Comedy Show" (sold out)
    const comedyShow = createdEvents.find((e) => e.name === 'Comedy Show: Stand-Up Night');
    if (comedyShow) {
      bookings.push(
        {
          userId: testUser1._id,
          eventId: comedyShow._id,
          ticketNumber: generateTicketNumber(comedyShow._id.toString(), 0),
          bookingDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          status: BookingStatus.CONFIRMED,
          idempotencyKey: generateIdempotencyKey(),
        }
      );
    }

    // Bookings for "Winter Wonderland Market"
    const winterMarket = createdEvents.find((e) => e.name === 'Winter Wonderland Market');
    if (winterMarket) {
      bookings.push(
        {
          userId: testUser2._id,
          eventId: winterMarket._id,
          ticketNumber: generateTicketNumber(winterMarket._id.toString(), 0),
          bookingDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
          status: BookingStatus.PENDING,
          expiresAt: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000), // 11 days from now
          idempotencyKey: generateIdempotencyKey(),
        }
      );
    }

    // Bookings for completed event
    const newYearEvent = createdEvents.find((e) => e.name === 'New Year Celebration 2025');
    if (newYearEvent) {
      bookings.push(
        {
          userId: testUser1._id,
          eventId: newYearEvent._id,
          ticketNumber: generateTicketNumber(newYearEvent._id.toString(), 0),
          bookingDate: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
          status: BookingStatus.CONFIRMED,
          idempotencyKey: generateIdempotencyKey(),
        },
        {
          userId: testUser2._id,
          eventId: newYearEvent._id,
          ticketNumber: generateTicketNumber(newYearEvent._id.toString(), 1),
          bookingDate: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
          status: BookingStatus.CONFIRMED,
          idempotencyKey: generateIdempotencyKey(),
        }
      );
    }

    if (bookings.length > 0) {
      const createdBookings = await Booking.insertMany(bookings);
      console.log(`  ✓ Created ${createdBookings.length} bookings\n`);
    }

    // ── Summary ──────────────────────────────────────────────────────────
    console.log('✅ Database seeding completed!\n');
    console.log('📊 Summary:');
    console.log(`   - Events: ${createdEvents.length}`);
    console.log(`   - Bookings: ${bookings.length}`);
    console.log(`   - Users: 3 (testuser1, testuser2, admin)\n`);

    console.log('📝 Test Users:');
    console.log('   - testuser1@example.com (Password: Password123)');
    console.log('   - testuser2@example.com (Password: Password123)');
    console.log('   - admin@example.com (Password: Password123)\n');

    console.log('🎫 Event Statuses:');
    const publishedCount = createdEvents.filter((e) => e.status === EventStatus.PUBLISHED).length;
    const draftCount = createdEvents.filter((e) => e.status === EventStatus.DRAFT).length;
    const cancelledCount = createdEvents.filter((e) => e.status === EventStatus.CANCELLED).length;
    const completedCount = createdEvents.filter((e) => e.status === EventStatus.COMPLETED).length;
    console.log(`   - Published: ${publishedCount}`);
    console.log(`   - Draft: ${draftCount}`);
    console.log(`   - Cancelled: ${cancelledCount}`);
    console.log(`   - Completed: ${completedCount}\n`);

    console.log('🎟️  Booking Statuses:');
    const confirmedCount = bookings.filter((b) => b.status === BookingStatus.CONFIRMED).length;
    const cancelledCount2 = bookings.filter((b) => b.status === BookingStatus.CANCELLED).length;
    const pendingCount = bookings.filter((b) => b.status === BookingStatus.PENDING).length;
    console.log(`   - Confirmed: ${confirmedCount}`);
    console.log(`   - Cancelled: ${cancelledCount2}`);
    console.log(`   - Pending: ${pendingCount}\n`);

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();

