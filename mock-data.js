/* Mock Opera PMS + TrustYou data for K-Connect demo.
 * Replace with live /api/guest?room=N once IT wires Opera. */
(function () {
    const today = new Date();
    const iso = (d) => d.toISOString().slice(0, 10);
    const shift = (days) => { const d = new Date(today); d.setDate(d.getDate() + days); return iso(d); };

    window.__MOCK_GUESTS__ = {
        "101": {
            room: "101",
            roomType: "Deluxe Ocean Front",
            guests: [{ title: "Mrs", firstName: "Sofia", lastName: "Lindqvist", age: "55-64" }],
            nationality: "Swedish",
            language: "English",
            arrival: shift(-2),
            departure: shift(5),
            nightsRemaining: 5,
            bookingSource: "TUI",
            vipTier: "Katathani Platinum",
            loyaltyYears: 6,
            occasions: ["Repeat guest (8th stay)"],
            signals: [
                { type: "good", label: "Repeat guest · 8th stay", critical: false },
                { type: "good", label: "Requested pillow menu", critical: false },
                { type: "good", label: "TrustYou 9.4 · last stay", critical: false }
            ],
            specialRequests: ["Extra pillows (medium-soft)", "Late checkout requested", "Room away from lift"],
            approachChips: [
                { label: "Welcome back by name", icon: "heart" },
                { label: "Mention her favourite breakfast seat", icon: "sun" },
                { label: "Offer sunset beverage", icon: "glass" }
            ],
            preferences: ["No pork", "Still water on arrival", "Sea-view table at breakfast", "Prefers Thai tea"],
            previousNotes: [
                { date: "2025-11-14", by: "GR · Ploy", text: "Celebrated her husband's 60th last stay. Loved the jasmine turndown — please repeat." },
                { date: "2024-08-02", by: "GR · Meaw", text: "Sensitive to strong AC. Set room to 24°C before arrival." }
            ],
            xfile: null
        },

        "214": {
            room: "214",
            roomType: "Pool Villa",
            guests: [
                { title: "Mr", firstName: "Daniel", lastName: "Harper", age: "35-44" },
                { title: "Mrs", firstName: "Emily", lastName: "Harper", age: "35-44" }
            ],
            nationality: "British",
            language: "English",
            arrival: shift(0),
            departure: shift(7),
            nightsRemaining: 7,
            bookingSource: "Direct",
            vipTier: "VIP · Honeymoon",
            loyaltyYears: 0,
            occasions: ["Honeymoon", "Anniversary tomorrow"],
            signals: [
                { type: "good", label: "Honeymoon", critical: false },
                { type: "good", label: "Anniversary · tomorrow", critical: false },
                { type: "risk", label: "Requested room change yesterday", critical: false }
            ],
            specialRequests: ["Rose petal turndown", "Champagne on arrival", "Couple's spa booked Day 3"],
            approachChips: [
                { label: "Congratulate on honeymoon", icon: "heart" },
                { label: "Confirm anniversary set-up 18:00", icon: "sparkle" },
                { label: "Apologise for earlier room move", icon: "leaf" }
            ],
            preferences: ["Vegetarian (wife)", "Sparkling water", "Prefers beach lunch over pool"],
            previousNotes: [
                { date: shift(-1), by: "GR · Nok", text: "Moved from 210 to 214 due to AC fault. Compensated with fruit platter. Mr Harper gracious; Mrs Harper a little tired." }
            ],
            xfile: null
        },

        "308": {
            room: "308",
            roomType: "Family Grand Deluxe",
            guests: [
                { title: "Mr", firstName: "Marco", lastName: "Rossi", age: "45-54" },
                { title: "Mrs", firstName: "Giulia", lastName: "Rossi", age: "45-54" }
            ],
            nationality: "Italian",
            language: "Italian / English",
            arrival: shift(-4),
            departure: shift(2),
            nightsRemaining: 2,
            bookingSource: "Booking.com",
            vipTier: "Standard",
            loyaltyYears: 0,
            occasions: ["Daughter's 7th birthday tomorrow"],
            signals: [
                { type: "good", label: "Daughter's birthday · tomorrow", critical: false },
                { type: "risk", label: "Complaint on file · pool noise", critical: false },
                { type: "risk", label: "Didn't get what expected (villa)", critical: true }
            ],
            specialRequests: ["Cot for infant", "Kids' pool slot booked"],
            approachChips: [
                { label: "Apologise for villa mix-up", icon: "leaf" },
                { label: "Offer upgrade to V2 last night", icon: "sparkle" },
                { label: "Sing happy birthday at dinner", icon: "cake" },
                { label: "Follow up before check-out", icon: "clock" }
            ],
            preferences: ["Gluten-free (Giulia)", "Kids menu at breakfast", "Pool towels pre-placed"],
            previousNotes: [
                { date: shift(-3), by: "GR · Tan", text: "Expected pool villa (booked through OTA). Explained villa category difference. Family accepted Grand Deluxe with room credit 2,000 THB." },
                { date: shift(-2), by: "GR · Tan", text: "Complained about late-night pool music. Security followed up. Offered breakfast upgrade." }
            ],
            xfile: {
                level: "amber",
                text: "Guest is wavering on whether to post negative review. Recover before departure. Mrs Rossi more sensitive — address her first."
            }
        },

        "412": {
            room: "412",
            roomType: "Beachfront Junior Suite",
            guests: [{ title: "Ms", firstName: "Yuki", lastName: "Tanaka", age: "25-34" }],
            nationality: "Japanese",
            language: "Japanese (basic English)",
            arrival: shift(-1),
            departure: shift(3),
            nightsRemaining: 3,
            bookingSource: "JTB",
            vipTier: "Standard",
            loyaltyYears: 0,
            occasions: ["Solo traveller", "Birthday today"],
            signals: [
                { type: "good", label: "Birthday · today", critical: false },
                { type: "good", label: "First stay · high expectation", critical: false },
                { type: "risk", label: "Language barrier noted", critical: false }
            ],
            specialRequests: ["Quiet room requested", "No spicy food"],
            approachChips: [
                { label: "Greet in Japanese: 'Otanjoubi omedetou'", icon: "cake" },
                { label: "Offer birthday cake to room", icon: "sparkle" },
                { label: "Use Japanese menu at dinner", icon: "leaf" }
            ],
            preferences: ["No cilantro", "Green tea on arrival", "Prefers quiet dining areas"],
            previousNotes: [],
            xfile: null
        },

        "501": {
            room: "501",
            roomType: "Presidential Suite",
            guests: [
                { title: "H.E.", firstName: "Ahmed", lastName: "Al-Farsi", age: "55-64" },
                { title: "Mrs", firstName: "Layla", lastName: "Al-Farsi", age: "45-54" }
            ],
            nationality: "Emirati",
            language: "Arabic / English",
            arrival: shift(-1),
            departure: shift(6),
            nightsRemaining: 6,
            bookingSource: "Direct · Travel Agent",
            vipTier: "VVIP · Owner's list",
            loyaltyYears: 12,
            occasions: ["Repeat guest (14th stay)", "Travelling with family of 6"],
            signals: [
                { type: "good", label: "VVIP · Owner's list", critical: false },
                { type: "good", label: "Repeat · 14th stay", critical: false },
                { type: "risk", label: "X-file · privacy sensitive", critical: true }
            ],
            specialRequests: ["Halal menu only", "Butler service", "Prayer mat + Qibla marker", "No alcohol service in suite"],
            approachChips: [
                { label: "Greet H.E. by title", icon: "sparkle" },
                { label: "Confirm halal set-up", icon: "leaf" },
                { label: "No photo near suite", icon: "shield" },
                { label: "Coordinate butler 07:00 daily", icon: "clock" }
            ],
            preferences: ["Halal", "Strong Arabic coffee mornings", "Private dining pavilion", "Female staff only for Mrs Al-Farsi's area"],
            previousNotes: [
                { date: "2025-01-18", by: "GM · Chartchai", text: "Privacy is paramount. Never use names in public. All service through butler Pong." },
                { date: "2024-11-04", by: "GR · Ploy", text: "Loves the frangipani spa ritual. Pre-book day 2 for Mrs Al-Farsi." }
            ],
            xfile: {
                level: "red",
                text: "STRICT privacy. No photos in public areas. Staff not to approach unless signalled. All requests route via Butler Pong. Visible only to GR + Management."
            }
        }
    };

    window.__MOCK_STAFF__ = {
        "ploy@katathani.com":    { pin: "1234", name: "Ploy", role: "gr" },
        "meaw@katathani.com":    { pin: "1234", name: "Meaw", role: "gr" },
        "chartchai@katathani.com": { pin: "9999", name: "Khun Chartchai", role: "management" },
        "demo@katathani.com":    { pin: "0000", name: "Demo User", role: "gr" }
    };
})();
