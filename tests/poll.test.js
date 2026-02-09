const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index'); 

describe('Poll Integration', () => {
    let mongoServer;
    let token;
    
    // 1. Create a variable to hold the random email we generate
    let testEmail; 

    jest.setTimeout(60000);

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());

        app.set('io', { to: () => ({ emit: () => {} }), emit: () => {} });

        // 2. Generate the email ONCE
        testEmail = `test${Date.now()}@example.com`;

        console.log("👉 Registering with:", testEmail);

        const res = await request(app).post('/api/users/register').send({
            name: "TestUser",
            email: testEmail, // Use the variable
            password: "password123"
        });

        // 3. If token is missing, use the SAME email to login
        if (res.body.token) {
            token = res.body.token;
        } else {
            console.log("⚠️ No token in register, logging in...");
            token = await loginUser();
        }
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it('should create a poll', async () => {
        // Sanity check: Ensure we actually got a token
        expect(token).toBeDefined();

        const res = await request(app)
            .post('/api/polls')
            .set('Authorization', `Bearer ${token}`)
            .send({
                question: "Tabs or Spaces?",
                options: [{ text: "Tabs" }, { text: "Spaces" }],
                settings: { isPublic: true }
            });

        // Debug log if it fails
        if (res.statusCode !== 201) console.log("❌ Error:", res.body);
        
        expect(res.statusCode).toEqual(201);
    });

    async function loginUser() {
        const res = await request(app).post('/api/users/login').send({
            email: testEmail, // <--- FIX: Use the SAME variable here!
            password: "password123"
        });
        return res.body.token;
    }
});