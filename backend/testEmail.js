import dotenv from 'dotenv';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from './services/emailService.js';

dotenv.config();

// Mock order object that matches the real Order model shape
const mockOrder = {
    _id: { toString: () => 'TEST001A3F9C2E1' },
    createdAt: new Date(),
    totalAmount: 2812.35,
    paymentMethod: 'cod',
    items: [
        { titleSnapshot: 'Black Saree',             quantity: 1, priceSnapshot: 2000.00 },
        { titleSnapshot: 'Pedigree Adult Dog Food',  quantity: 1, priceSnapshot: 976.20  },
        { titleSnapshot: 'Phillips Air Fryer XL',   quantity: 1, priceSnapshot: 812.35  }
    ],
    ShippingAddress: {
        street:  '42, Rajiv Gandhi Nagar',
        city:    'Hyderabad',
        state:   'Telangana',
        zipCode: '500072',
        country: 'India'
    }
};

const TEST_EMAIL = process.env.BREVO_SENDER_EMAIL;
const TEST_NAME  = 'Manoj Kumar';

async function runTests() {
    console.log('\n========================================');
    console.log('  Shopzo Email Service Test Runner');
    console.log('========================================');
    console.log(`Sending test emails to: ${TEST_EMAIL}\n`);

    // ── Test 1: Order Confirmation (on order placement) ─────────────────────
    console.log('▶ Test 1: Order Confirmation Email (placed on order creation)...');
    const confirmResult = await sendOrderConfirmationEmail(TEST_EMAIL, TEST_NAME, mockOrder);
    if (confirmResult.success) {
        console.log(`  ✅ PASSED — Message ID: ${confirmResult.messageId}`);
    } else {
        console.log(`  ❌ FAILED — ${confirmResult.error}`);
    }

    // ── Test 2: Status Change → SHIPPED ─────────────────────────────────────
    console.log('\n▶ Test 2: Status Change Email → SHIPPED...');
    const shippedResult = await sendOrderStatusEmail(TEST_EMAIL, TEST_NAME, mockOrder, 'SHIPPED');
    if (shippedResult.success) {
        console.log(`  ✅ PASSED — Message ID: ${shippedResult.messageId}`);
    } else {
        console.log(`  ❌ FAILED — ${shippedResult.error}`);
    }

    // ── Test 3: Status Change → DELIVERED ───────────────────────────────────
    console.log('\n▶ Test 3: Status Change Email → DELIVERED...');
    const deliveredResult = await sendOrderStatusEmail(TEST_EMAIL, TEST_NAME, mockOrder, 'DELIVERED');
    if (deliveredResult.success) {
        console.log(`  ✅ PASSED — Message ID: ${deliveredResult.messageId}`);
    } else {
        console.log(`  ❌ FAILED — ${deliveredResult.error}`);
    }

    // ── Test 4: Status Change → CANCELLED ───────────────────────────────────
    console.log('\n▶ Test 4: Status Change Email → CANCELLED...');
    const cancelledResult = await sendOrderStatusEmail(TEST_EMAIL, TEST_NAME, mockOrder, 'CANCELLED');
    if (cancelledResult.success) {
        console.log(`  ✅ PASSED — Message ID: ${cancelledResult.messageId}`);
    } else {
        console.log(`  ❌ FAILED — ${cancelledResult.error}`);
    }

    // ── Summary ──────────────────────────────────────────────────────────────
    const results = [confirmResult, shippedResult, deliveredResult, cancelledResult];
    const passed  = results.filter(r => r.success).length;
    const failed  = results.filter(r => !r.success).length;

    console.log('\n========================================');
    console.log(`  Results: ${passed}/4 passed, ${failed}/4 failed`);
    console.log('========================================');

    if (passed === 4) {
        console.log('  🎉 All email tests passed!');
        console.log(`  Check your inbox at: ${TEST_EMAIL}`);
    } else {
        console.log('  ⚠️  Some tests failed. Check BREVO_SMTP_KEY and BREVO_SENDER_EMAIL in .env');
    }
    console.log('');
    process.exit(failed > 0 ? 1 : 0);
}

runTests();
