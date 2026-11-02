import fs from 'fs';
import path from 'path';

const uploads = JSON.parse(
  fs.readFileSync('C:/Users/tsoni/Desktop/vastu/cloudinary_uploads.json', 'utf8')
);

const productsMeta = [
  {
    file: "WhatsApp Image 2026-11-01 at 8.07.49 PM.jpeg",
    title: "Bhuwneshwari Prosperity Spray (100ml)",
    category: "Oils & Sprays",
    shortDescription: "Manifest abundance, open wealth channels and create fresh opportunities in your home and workplace.",
    description: "Conconctrated with sacred herbs, essential botanical extracts, and energized under Vedic Lakshmi-Kuber mantras. Spray daily in the North, Northeast, and cash locker areas to dissolve financial stagnancy and attract continuous prosperous opportunities.",
    regularPrice: 1299,
    salePrice: 899,
    featured: true,
    tags: ["prosperity", "spray", "wealth", "abundance", "lakshmi", "vastu remedies"],
    specifications: [
      { label: "Volume", value: "100ml" },
      { label: "Application", value: "Room & Aura Spray" },
      { label: "Direction", value: "North / Northeast / Cash Area" },
      { label: "Energized", value: "Conconctrated with Vedic Abundance Mantras" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.07.50 PM (1).jpeg",
    title: "Career Blockage Cleanse Spray (100ml)",
    category: "Oils & Sprays",
    shortDescription: "Removes stagnant career obstacles, enhances mental focus, and supports promotions and workplace recognition.",
    description: "Specially formulated to dissolve unseen obstacles in professional advancement, business closures, and workplace slowdowns. Cleanses negative vibrations surrounding your study or office desk, instilling clarity and motivation.",
    regularPrice: 1299,
    salePrice: 849,
    featured: false,
    tags: ["career", "cleanse", "spray", "focus", "growth", "success", "workplace"],
    specifications: [
      { label: "Volume", value: "100ml" },
      { label: "Application", value: "Workspace & Study Desk" },
      { label: "Direction", value: "North / East" },
      { label: "Energized", value: "Yes" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.07.50 PM (2).jpeg",
    title: "Money Magnet Spray (100ml)",
    category: "Oils & Sprays",
    shortDescription: "Magnetic energy spray designed to attract wealth flow, new deals, and multiply monetary prosperity.",
    description: "An intensive vibrational spray engineered to tune your physical and commercial surroundings to the frequency of financial reception. Perfect for retail counters, cash boxes, sales cabins, and main office reception areas.",
    regularPrice: 1399,
    salePrice: 949,
    featured: true,
    tags: ["money magnet", "wealth", "spray", "prosperity", "abundance", "cash flow"],
    specifications: [
      { label: "Volume", value: "100ml" },
      { label: "Application", value: "Aura & Commercial Space" },
      { label: "Direction", value: "North (Kuber Disha)" },
      { label: "Energized", value: "Yes" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.07.50 PM.jpeg",
    title: "Education Booster Spray (100ml)",
    category: "Oils & Sprays",
    shortDescription: "Boosts concentration, retention, study discipline, and academic confidence for students and learners.",
    description: "Formulated with Saraswati and Mercury energizing herbs to calm restless minds, sharpen cognitive recall, and eliminate distractions in students. Ideal for misting across study rooms, libraries, and reading desks before examination preparations.",
    regularPrice: 1199,
    salePrice: 799,
    featured: false,
    tags: ["education", "study booster", "concentration", "memory", "students", "spray"],
    specifications: [
      { label: "Volume", value: "100ml" },
      { label: "Application", value: "Study Area & Student Aura" },
      { label: "Direction", value: "Northeast / East" },
      { label: "Energized", value: "Saraswati Beej Mantra Activated" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.07.51 PM (1).jpeg",
    title: "Interview Success Spray (100ml)",
    category: "Oils & Sprays",
    shortDescription: "Empowers magnetic personal aura, calm eloquence, and influential authority during job interviews and pitching.",
    description: "Elevates personal presence, dissolves nervous anxiety, and amplifies persuasion frequencies during high-stakes corporate interviews, client pitches, and competitive selections. Use as an aura mist 15 minutes prior to pivotal meetings.",
    regularPrice: 1299,
    salePrice: 849,
    featured: false,
    tags: ["interview", "success", "spray", "confidence", "career", "aura spray"],
    specifications: [
      { label: "Volume", value: "100ml" },
      { label: "Application", value: "Personal Aura Mist" },
      { label: "Use Timing", value: "15 mins before interview/meeting" },
      { label: "Energized", value: "Yes" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.07.51 PM (2).jpeg",
    title: "Money Blockage Spray (100ml)",
    category: "Oils & Sprays",
    shortDescription: "Removes stuck financial locks, unpaid dues resistance, and heavy monetary stagnancy in premises.",
    description: "Targeted specifically at broken financial cycles, recurrent unexplained expenses, and stagnant business cash flows. Dissolves negative karmic and spatial energy traps obstructing income generation.",
    regularPrice: 1399,
    salePrice: 899,
    featured: false,
    tags: ["money blockage", "unblock wealth", "spray", "financial freedom", "vastu"],
    specifications: [
      { label: "Volume", value: "100ml" },
      { label: "Application", value: "Home Entrance & North Direction" },
      { label: "Energized", value: "Yes" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.07.51 PM.jpeg",
    title: "Money Recovery Spray (100ml)",
    category: "Oils & Sprays",
    shortDescription: "Facilitates recovery of blocked funds, pending client payments, loans, and delayed financial dues.",
    description: "A potent esoteric formulation infused with frequencies known to activate repayment intent and dissolve friction between debtors and creditors. Highly recommended for business owners and contractors dealing with delayed collections.",
    regularPrice: 1499,
    salePrice: 999,
    featured: true,
    tags: ["money recovery", "blocked funds", "debt clearance", "spray", "business vastu"],
    specifications: [
      { label: "Volume", value: "100ml" },
      { label: "Application", value: "Accounts Desk & North Direction" },
      { label: "Energized", value: "Yes" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.07.52 PM (1).jpeg",
    title: "Love Relationship Harmony Spray (100ml)",
    category: "Oils & Sprays",
    shortDescription: "Deepens marital affection, dissolves domestic conflicts, and restores romantic warmth in bedrooms.",
    description: "Infused with pure rose attar and Venusian planetary botanicals to soothe irritable tempers, eliminate lingering bedroom arguments, and re-establish heart-centered affection and understanding between partners.",
    regularPrice: 1299,
    salePrice: 849,
    featured: false,
    tags: ["love", "relationship", "marriage", "harmony", "spray", "venus", "bedroom vastu"],
    specifications: [
      { label: "Volume", value: "100ml" },
      { label: "Application", value: "Master Bedroom & Living Area" },
      { label: "Direction", value: "Southwest (Relationship Zone)" },
      { label: "Energized", value: "Yes" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.07.52 PM (2).jpeg",
    title: "Manifestation Spray (100ml)",
    category: "Oils & Sprays",
    shortDescription: "Harmonizes the seven subtle energy chakras to accelerate intent fulfillment and goal manifestation.",
    description: "An extraordinary cosmic alignment spray blending high-frequency sacred botanical distillates with solar and lunar bio-frequencies. Cleanses psychic clogs, allowing clear mental visualizations to manifest into physical reality.",
    regularPrice: 1399,
    salePrice: 899,
    featured: false,
    tags: ["manifestation", "chakras", "intention", "spray", "spiritual", "meditation"],
    specifications: [
      { label: "Volume", value: "100ml" },
      { label: "Application", value: "Meditation Area & Aura" },
      { label: "Direction", value: "Northeast / Ishan Corner" },
      { label: "Energized", value: "Yes" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.07.52 PM.jpeg",
    title: "Anti Office Politics Shield Spray (100ml)",
    category: "Oils & Sprays",
    shortDescription: "Shields your reputation from backbiting, workplace jealousy, malicious rumors, and toxic corporate politics.",
    description: "Creates an impenetrable energetic auric barrier against malevolent intentions, passive-aggressive coworkers, and unfair sabotage in corporate environments. Restores confidence and authentic respect.",
    regularPrice: 1299,
    salePrice: 849,
    featured: false,
    tags: ["office politics", "protection", "career shield", "spray", "workplace harmony"],
    specifications: [
      { label: "Volume", value: "100ml" },
      { label: "Application", value: "Office Desk & Personal Aura" },
      { label: "Energized", value: "Yes" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.07.53 PM (1).jpeg",
    title: "Exam Cleanse & Confidence Spray (100ml)",
    category: "Oils & Sprays",
    shortDescription: "Eliminates pre-exam panic, brain fog, and self-doubt while stimulating lucid memory and peak performance.",
    description: "Specially crafted for students preparing for competitive exams, board finals, and university assessments. Eliminates nervous test dread and establishes an aura of serene concentration.",
    regularPrice: 1199,
    salePrice: 799,
    featured: false,
    tags: ["exam cleanse", "students", "memory", "spray", "confidence", "tests"],
    specifications: [
      { label: "Volume", value: "100ml" },
      { label: "Application", value: "Study Area & Student Aura" },
      { label: "Energized", value: "Yes" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.07.53 PM (2).jpeg",
    title: "Anti Delay Marriage Spray (100ml)",
    category: "Oils & Sprays",
    shortDescription: "Neutralizes astrological and Vastu hurdles delaying wedding alliances and auspicious matchmaking.",
    description: "Addresses hidden matrimonial doshas in the home (such as defects in the Northwest Vayu and Southwest zones). Energized to speed up suitable proposals, mutual consent, and joyful union.",
    regularPrice: 1499,
    salePrice: 999,
    featured: true,
    tags: ["marriage", "anti delay", "proposals", "matrimony", "spray", "vastu dosh"],
    specifications: [
      { label: "Volume", value: "100ml" },
      { label: "Application", value: "Northwest / North Bedroom" },
      { label: "Energized", value: "Vedic Vivah Sankalpa Mantras" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.07.53 PM.jpeg",
    title: "Court Case Relief Spray (100ml)",
    category: "Oils & Sprays",
    shortDescription: "Promotes favorable legal resolutions, dispute settlement, and relief from prolonged litigation.",
    description: "Designed for individuals and businesses ensnared in stressful, unfair litigations or government notice complications. Spray lightly on legal file covers and litigation paperwork to attract justice and harmony.",
    regularPrice: 1599,
    salePrice: 1099,
    featured: false,
    tags: ["court case", "legal dispute", "justice", "litigation relief", "spray"],
    specifications: [
      { label: "Volume", value: "100ml" },
      { label: "Application", value: "Case Files & Southwest / East Zone" },
      { label: "Energized", value: "Yes" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.07.54 PM (1).jpeg",
    title: "Womb Healing & Feminine Energy Spray (100ml)",
    category: "Oils & Sprays",
    shortDescription: "Supports emotional sacral chakra healing, uterine energetic balance, and radiant maternal wellbeing.",
    description: "A tender, sacred botanical elixir formulated to release somatic stress, emotional trauma, and stagnant sacral blockages in women. Promotes restful inner peace, hormonal grounding, and nurturing comfort.",
    regularPrice: 1399,
    salePrice: 899,
    featured: false,
    tags: ["womb healing", "sacral chakra", "feminine energy", "emotional wellness", "spray"],
    specifications: [
      { label: "Volume", value: "100ml" },
      { label: "Application", value: "Bedroom & Personal Space" },
      { label: "Energized", value: "Yes" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.07.54 PM.jpeg",
    title: "Powerful Addiction Cure Spray (100ml)",
    category: "Oils & Sprays",
    shortDescription: "Calms obsessive cravings, cleanses compulsive auric attachments, and restores mental self-control.",
    description: "A restorative mind-body-soul vibrational mist intended to support individuals seeking freedom from substance dependencies, alcohol, tobacco, and digital overuse. Clears toxic etheric static from bedrooms and living quarters.",
    regularPrice: 1499,
    salePrice: 949,
    featured: false,
    tags: ["addiction cure", "habits", "self control", "purification", "spray", "mind body soul"],
    specifications: [
      { label: "Volume", value: "100ml" },
      { label: "Application", value: "Living Area & Bedroom" },
      { label: "Energized", value: "Yes" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.08.46 PM (1).jpeg",
    title: "Planet Mars (मंगल) Sacred Navagraha Spray (8ml)",
    category: "Navagraha Remedies",
    shortDescription: "Invokes the courage, vitality, and protective strength of Mangal Deva. Dispels Manglik dosha anxieties.",
    description: "Infused with pure red sandalwood, clove, and energetic minerals sacred to Planet Mars (Mangal). Sparks executive drive, physical stamina, leadership, and property acquisition luck while subduing hasty rage.",
    regularPrice: 799,
    salePrice: 499,
    featured: false,
    tags: ["mars", "mangal", "navagraha", "spray", "astrology", "courage", "property"],
    specifications: [
      { label: "Volume", value: "8ml" },
      { label: "Planet", value: "Mars (Mangal Deva)" },
      { label: "Element", value: "Fire / Tejas" },
      { label: "Direction", value: "South (Dakshin)" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.08.46 PM.jpeg",
    title: "Planet Moon (चन्द्रमा) Sacred Navagraha Spray (8ml)",
    category: "Navagraha Remedies",
    shortDescription: "Calms emotional volatility, cures sleep restlessness, and enhances poetic intuition and maternal blessings.",
    description: "Sacred planetary elixir dedicated to Chandra Deva (The Moon). Purifies the water element of your body and dwelling, eliminating anxiety, depressive mood swings, and insomnia.",
    regularPrice: 799,
    salePrice: 499,
    featured: false,
    tags: ["moon", "chandra", "navagraha", "peace", "calm", "spray", "intuition"],
    specifications: [
      { label: "Volume", value: "8ml" },
      { label: "Planet", value: "Moon (Chandra Deva)" },
      { label: "Element", value: "Water / Jala" },
      { label: "Direction", value: "Northwest (Vayu)" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.08.47 PM (1).jpeg",
    title: "Planet Mercury (बुध) Sacred Navagraha Spray (8ml)",
    category: "Navagraha Remedies",
    shortDescription: "Sharpens commercial intelligence, persuasive communication, analytical acumen, and business profitability.",
    description: "Consecrated under Budh Deva vibrations with tulsi, green cardamom, and botanical essences. Essential for traders, students, accountants, and communicators seeking sharp speech and profitable negotiation.",
    regularPrice: 799,
    salePrice: 499,
    featured: false,
    tags: ["mercury", "budh", "navagraha", "communication", "intellect", "business", "spray"],
    specifications: [
      { label: "Volume", value: "8ml" },
      { label: "Planet", value: "Mercury (Budha Deva)" },
      { label: "Element", value: "Earth / Prithvi" },
      { label: "Direction", value: "North" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.08.47 PM (2).jpeg",
    title: "Planet Sun (सूर्य) Sacred Navagraha Spray (8ml)",
    category: "Navagraha Remedies",
    shortDescription: "Radiates imperial vitality, regal authority, fame, good health, and government favor into your life.",
    description: "Carries the fiery, noble radiance of Surya Bhagwan. Re-energizes sluggish leadership, attracts public recognition, clears bone and heart energetic lethargy, and strengthens paternal bonds.",
    regularPrice: 799,
    salePrice: 499,
    featured: true,
    tags: ["sun", "surya", "navagraha", "authority", "vitality", "fame", "spray"],
    specifications: [
      { label: "Volume", value: "8ml" },
      { label: "Planet", value: "Sun (Surya Deva)" },
      { label: "Element", value: "Fire / Tejas" },
      { label: "Direction", value: "East (Poorva)" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.08.47 PM.jpeg",
    title: "Planet Jupiter (गुरु) Sacred Navagraha Spray (8ml)",
    category: "Navagraha Remedies",
    shortDescription: "Bestows divine wisdom, high spiritual merit, wealth expansion, and benevolent mentorship.",
    description: "Invokes Brihaspati Deva (Guru) through saffron, turmeric distillates, and sacred woods. Expands knowledge, brings moral clarity, protects family fortunes, and removes education and marital hurdles.",
    regularPrice: 799,
    salePrice: 499,
    featured: false,
    tags: ["jupiter", "guru", "navagraha", "wisdom", "wealth", "spirituality", "spray"],
    specifications: [
      { label: "Volume", value: "8ml" },
      { label: "Planet", value: "Jupiter (Brihaspati / Guru)" },
      { label: "Element", value: "Ether / Akasha" },
      { label: "Direction", value: "Northeast (Ishan)" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.08.48 PM (1).jpeg",
    title: "Planet Venus (शुक्र) Sacred Navagraha Spray (8ml)",
    category: "Navagraha Remedies",
    shortDescription: "Attracts luxury, glamorous aesthetics, artistic mastery, marital joy, and magnetic personal charm.",
    description: "Devoted to Shukra Deva. Enriched with exotic floral extracts that enhance charm, sensual harmony, artistic inspiration, and material opulence.",
    regularPrice: 799,
    salePrice: 499,
    featured: false,
    tags: ["venus", "shukra", "navagraha", "luxury", "beauty", "charm", "spray"],
    specifications: [
      { label: "Volume", value: "8ml" },
      { label: "Planet", value: "Venus (Shukra Deva)" },
      { label: "Element", value: "Water / Jala" },
      { label: "Direction", value: "Southeast (Agneya)" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.08.48 PM.jpeg",
    title: "Planet Saturn (शनि) Sacred Navagraha Spray (8ml)",
    category: "Navagraha Remedies",
    shortDescription: "Pacifies Saturnine trials, instills unbreakable discipline, perseverance, and long-term triumph.",
    description: "Dedicated to Shani Deva. Purifies heavy karmic burdens, aids in enduring difficult transitions (Sade Sati / Dhaiya), and turns disciplined labor into lasting, unshakable success.",
    regularPrice: 799,
    salePrice: 499,
    featured: false,
    tags: ["saturn", "shani", "navagraha", "karma", "discipline", "justice", "spray"],
    specifications: [
      { label: "Volume", value: "8ml" },
      { label: "Planet", value: "Saturn (Shani Deva)" },
      { label: "Element", value: "Air / Vayu" },
      { label: "Direction", value: "West (Paschim)" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.10.11 PM (1).jpeg",
    title: "Saturn (शनि) Essential Oil Roll On (10ml)",
    category: "Oils & Sprays",
    shortDescription: "Grounding roll-on applicator infused with sacred botanicals for Shani protection and karmic balance.",
    description: "Portable 10ml essential oil blend with a smooth stainless roller ball. Apply to pulse points, wrists, and temples to invite patience, steady endurance, and protective karmic alignment throughout your workday.",
    regularPrice: 899,
    salePrice: 599,
    featured: false,
    tags: ["saturn roll on", "shani oil", "essential oil", "roll on", "grounding", "karma"],
    specifications: [
      { label: "Volume", value: "10ml (0.33 fl oz)" },
      { label: "Type", value: "Essential Oil Roll-On with Gift Box" },
      { label: "Base", value: "Fractionated Coconut & Pure Botanicals" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.10.11 PM.jpeg",
    title: "Venus (शुक्र) Essential Oil Roll On (10ml)",
    category: "Oils & Sprays",
    shortDescription: "Deluxe roller oil for magnetic personal magnetism, romantic charisma, and luxurious emotional warmth.",
    description: "Infused with damask rose, ylang-ylang, and Venusian botanical resins. Glide over wrists and neck to emanate an irresistibly pleasant, alluring vibration wherever you go.",
    regularPrice: 899,
    salePrice: 599,
    featured: false,
    tags: ["venus roll on", "shukra oil", "essential oil", "attraction", "charm", "love"],
    specifications: [
      { label: "Volume", value: "10ml (0.33 fl oz)" },
      { label: "Type", value: "Roll-On with Gift Box" },
      { label: "Scent Profile", value: "Floral & Sensual" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.10.12 PM (1).jpeg",
    title: "Mercury (बुध) Essential Oil Roll On (10ml)",
    category: "Oils & Sprays",
    shortDescription: "Cognitive stimulant roll-on to heighten eloquent speech, commercial deal-making, and rapid calculations.",
    description: "A refreshing herbal roll-on carrying peppermint, sweet basil, and green citrus essences. Roll on before negotiation meetings, classes, or presentations to articulate ideas with effortless poise.",
    regularPrice: 899,
    salePrice: 599,
    featured: false,
    tags: ["mercury roll on", "budh oil", "communication", "focus", "essential oil"],
    specifications: [
      { label: "Volume", value: "10ml (0.33 fl oz)" },
      { label: "Type", value: "Roll-On with Gift Box" },
      { label: "Application", value: "Temples & Wrists" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.10.12 PM (2).jpeg",
    title: "Jupiter (गुरु) Essential Oil Roll On (10ml)",
    category: "Oils & Sprays",
    shortDescription: "Auspicious roller oil for wisdom, optimism, prosperity, and divine mentor blessings.",
    description: "Infused with sacred saffron, benzoin, and golden frankincense. Calms anxieties, awakens intuitive wisdom, and invites honorable mentors and lucrative fortune into your endeavors.",
    regularPrice: 899,
    salePrice: 599,
    featured: false,
    tags: ["jupiter roll on", "guru oil", "wisdom", "optimism", "essential oil"],
    specifications: [
      { label: "Volume", value: "10ml (0.33 fl oz)" },
      { label: "Type", value: "Roll-On with Gift Box" },
      { label: "Planetary Ruler", value: "Brihaspati (Jupiter)" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.10.12 PM.jpeg",
    title: "Mars (मंगल) Essential Oil Roll On (10ml)",
    category: "Oils & Sprays",
    shortDescription: "Invigorating roller oil to fire up willpower, fearless determination, and competitive stamina.",
    description: "Contains warming spices, ginger, and ruby-energetic essences to disperse lethargy and self-doubt. Roll on before workouts, high-stakes decisions, or when confronting demanding challenges.",
    regularPrice: 899,
    salePrice: 599,
    featured: false,
    tags: ["mars roll on", "mangal oil", "energy", "courage", "stamina", "essential oil"],
    specifications: [
      { label: "Volume", value: "10ml (0.33 fl oz)" },
      { label: "Type", value: "Roll-On with Gift Box" },
      { label: "Vibe", value: "Energizing & Grounding" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.10.13 PM.jpeg",
    title: "Sun (सूर्य) Essential Oil Roll On (10ml)",
    category: "Oils & Sprays",
    shortDescription: "Solar radiant roller oil for vibrant leadership aura, public confidence, and radiant life energy.",
    description: "Charged with golden amber, bergamot, and solarized herbal oils. Roll on wrists and collarbones every morning to ignite the inner leader and command positive attention and admiration.",
    regularPrice: 899,
    salePrice: 599,
    featured: true,
    tags: ["sun roll on", "surya oil", "leadership", "vitality", "confidence", "essential oil"],
    specifications: [
      { label: "Volume", value: "10ml (0.35 fl oz)" },
      { label: "Type", value: "Amber Glass Roll-On" },
      { label: "Planetary Ruler", value: "Surya Deva (The Sun)" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.11.04 PM (1).jpeg",
    title: "Toilet Vastu Dosh Remedy Oil (15ml)",
    category: "Oils & Sprays",
    shortDescription: "Specially formulated essential oil to suppress and neutralize toxic drainage defects of ill-placed toilets.",
    description: "Toilets in the Northeast, East, or North severely drain family health and prosperity. Diffusing or placing a few drops of this consecrated neutralizing oil daily dissolves negative bathroom vibrations without breaking walls.",
    regularPrice: 999,
    salePrice: 649,
    featured: true,
    tags: ["toilet oil", "vastu dosh", "drainage remedy", "non destructive vastu", "remedy oil"],
    specifications: [
      { label: "Volume", value: "15ml" },
      { label: "Usage", value: "Diffuser or Salt Bowl Drops" },
      { label: "Application Zone", value: "Toilet & Washroom Areas" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.11.04 PM.jpeg",
    title: "Kitchen Vastu Dosh Remedy Oil (15ml)",
    category: "Oils & Sprays",
    shortDescription: "Balancing fire-element energy oil for kitchens situated in North, Northeast, or Southwest directions.",
    description: "An improperly oriented kitchen causes domestic strife, health complications, and volatile finances. This aromatic correcting oil re-aligns the Agni element to preserve digestive health and family harmony.",
    regularPrice: 999,
    salePrice: 649,
    featured: false,
    tags: ["kitchen oil", "fire element", "vastu remedy", "agni dosh", "essential oil"],
    specifications: [
      { label: "Volume", value: "15ml" },
      { label: "Usage", value: "Aroma burner or ceramic diffuser" },
      { label: "Application Zone", value: "Kitchen Counter / Cooking Area" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.11.10 PM.jpeg",
    title: "Supervisor to President's Team Leadership Medallion",
    category: "Pyramids & Yantras",
    shortDescription: "Symbolic dual-tone executive victory medallion inspiring relentless resilience and extraordinary achievement.",
    description: "An elite motivational talisman featuring the split Supervisor-to-President emblem adorned with sparkling crystal facets. Inscribed with: 'A President is a Supervisor who never gave up on the journey'. Perfect for executive offices, trophy tables, and entrepreneurs.",
    regularPrice: 2999,
    salePrice: 1999,
    featured: false,
    tags: ["leadership medallion", "executive", "success", "motivation", "trophy", "entrepreneur"],
    specifications: [
      { label: "Material", value: "Heavy Gold & Silver Tone Alloy" },
      { label: "Inlay", value: "High Grade Faceted Crystals" },
      { label: "Placement", value: "Work Desk / Office Display / Trophy Shelf" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.11.58 PM.jpeg",
    title: "Golden Vastu Purusha Mandala 25-Grid Cosmic Energy Plate",
    category: "Pyramids & Yantras",
    shortDescription: "Heavy brass 25-symbol cosmic grid plate harmonizing the 16 Vastu zones and 45 energy deities.",
    description: "Mastercrafted sacred golden plate showcasing sacred symbols: Shankha, Swastika, Chandra, Surya, Padma, and protective deities. Emits continuous scalar vibrations to elevate the structural aura of any residential or commercial property.",
    regularPrice: 4999,
    salePrice: 3499,
    featured: true,
    tags: ["vastu purusha", "mandala plate", "yantra", "brass plate", "cosmic energy", "sacred symbols"],
    specifications: [
      { label: "Material", value: "Pure Consecrated Brass with 24K Gold Polish" },
      { label: "Grid Count", value: "25 Sacred Archetypal Compartments" },
      { label: "Placement", value: "Brahmasthan / Main Hall / Temple Wall" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.12.48 PM.jpeg",
    title: "Tri-Shakti Hreem (ह्रीं) Sacred Fire Energy Triangle Frame",
    category: "Pyramids & Yantras",
    shortDescription: "Triple triangular power frame featuring the Bhuwneshwari Beej Mantra 'ह्रीं' for fierce transformation.",
    description: "Houses three consecrated brass/wood Agni energy pyramids embossed with the potent Mahavidya Bhuwneshwari beej mantra 'ह्रीं'. Dissolves darkness, awakens radiant vitality, and balances the fire quadrant of your home.",
    regularPrice: 3499,
    salePrice: 2499,
    featured: true,
    tags: ["hreem", "bhuwneshwari", "triangle frame", "beej mantra", "fire element", "yantra frame"],
    specifications: [
      { label: "Frame Dimensions", value: "18 x 9 Inches" },
      { label: "Pyramids", value: "Triple Precision Geometry Triangles" },
      { label: "Mantra", value: "Divine Beej Mantra 'ह्रीं'" },
      { label: "Direction", value: "Southeast (Agneya) / South" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.12.57 PM.jpeg",
    title: "Tri-Spiral Shree (श्रीं) Wealth Vortex Energy Frame",
    category: "Pyramids & Yantras",
    shortDescription: "Triple concentric spiral wealth frame holding the sacred Lakshmi Beej 'श्रीं' to magnetize financial flow.",
    description: "Features triple golden spiral vortexes that pull cosmic Prana into physical wealth accumulation. Centered with the holy Lakshmi Beej 'श्रीं'. Ideal for luxury living rooms, reception areas, and business directors' suites.",
    regularPrice: 3499,
    salePrice: 2499,
    featured: true,
    tags: ["shree", "spiral frame", "wealth vortex", "lakshmi mantra", "luxury decor", "vastu frame"],
    specifications: [
      { label: "Frame Dimensions", value: "18 x 9 Inches" },
      { label: "Vortex Geometry", value: "Triple Golden Spiral Dynamic Rings" },
      { label: "Mantra", value: "Sacred Beej Mantra 'श्रीं'" },
      { label: "Direction", value: "North / Northeast / East" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.14.11 PM.jpeg",
    title: "Pure Bhimseni Natural Camphor Crystals (भीमसेनी कपूर 500g)",
    category: "Purification & Salts",
    shortDescription: "100% natural organic raw Bhimseni camphor rocks for profound negative energy purification and havan.",
    description: "Authentic, chemical-free Bhimseni camphor chunks in a sealed freshness pouch. Burning or diffusing pure Bhimseni camphor instantly clears stagnant bio-toxins, repels harmful unseen energies, and charges the air with sublime sattvic tranquility.",
    regularPrice: 999,
    salePrice: 699,
    featured: false,
    tags: ["bhimseni camphor", "kapoor", "purification", "natural camphor", "havan", "sattvic"],
    specifications: [
      { label: "Net Weight", value: "500g Pouch" },
      { label: "Purity", value: "100% Natural Raw Bhimseni Grade" },
      { label: "Use", value: "Diffuser, Aarti, Space Cleansing" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.14.47 PM.jpeg",
    title: "Seven Chakra Aura Cleansing Bath Salt (Jar)",
    category: "Purification & Salts",
    shortDescription: "Mineral-rich therapeutic bath crystal salt to dissolve heavy auric debris and align the 7 energy chakras.",
    description: "Blended with pure Himalayan rock salts, Dead Sea salts, and seven essential chakra essential oils. Taking a foot soak or warm bath with this energized salt strips away mental fatigue, toxic emotional absorption, and psychic heaviness.",
    regularPrice: 1199,
    salePrice: 799,
    featured: false,
    tags: ["bath salt", "seven chakra", "aura cleansing", "mineral salt", "relaxation", "spa"],
    specifications: [
      { label: "Packaging", value: "500g Airtight Jar" },
      { label: "Ingredients", value: "Himalayan Pink Salt, Epsom, Chakra Oils" },
      { label: "Use", value: "Bath / Foot Soak / Salt Therapy" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.15.06 PM.jpeg",
    title: "Bhuwneshwari Multipurpose Solid Brass Vastu Energy Rod",
    category: "Vastu Rods & Neutralizers",
    shortDescription: "Precision-machined solid brass harmonizer rod to neutralize general structural Vastu imperfections.",
    description: "An authentic, heavy solid brass energy rod engraved with 'BHUWNESHWARI SCIENTIFIC VASTU'. Used by professional Vastu consultants to install beneath door thresholds, flooring, or along walls to create energy barriers and correct spatial imbalances without demolition.",
    regularPrice: 1899,
    salePrice: 1299,
    featured: true,
    tags: ["brass rod", "multipurpose rod", "vastu neutralizer", "energy rod", "threshold remedy"],
    specifications: [
      { label: "Material", value: "Heavy Grade Solid Brass (Pure Peetal)" },
      { label: "Engraving", value: "Bhuwneshwari Scientific Vastu Multipurpose" },
      { label: "Installation", value: "Threshold / Under Floor / Wall Base" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.15.23 PM.jpeg",
    title: "Pitra Dosh Nivaran Solid Brass Vastu Rod",
    category: "Vastu Rods & Neutralizers",
    shortDescription: "Specialized consecrated brass rod to pacify ancestral Pitra Dosh and stabilize the Southwest corner.",
    description: "Engineered specifically to counter South and Southwest architectural faults that trigger ancestral discontent, chronic family ailments, or delayed lineage progress. Consecrated with sacred Vedic Pitra Tarpan rituals.",
    regularPrice: 1999,
    salePrice: 1399,
    featured: false,
    tags: ["pitra dosh rod", "southwest remedy", "brass rod", "ancestral dosha", "vastu rod"],
    specifications: [
      { label: "Material", value: "Solid Heavy Brass" },
      { label: "Label", value: "Pitra Dosh Consecrated" },
      { label: "Target Zone", value: "Southwest (Nairutya Disha)" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.15.57 PM.jpeg",
    title: "Geopathic Stress Reversal Solid Brass Vastu Rod",
    category: "Vastu Rods & Neutralizers",
    shortDescription: "Deflects harmful underground earth radiation, Hartmann grid lines, and geopathic energy faults.",
    description: "Subterranean water veins and earth fault lines drain the immune system and cause unexplained sleep disturbances. This heavy brass geopathic rod neutralizes harmful subterranean wavelengths, creating a stable, protective scalar field above.",
    regularPrice: 2199,
    salePrice: 1499,
    featured: true,
    tags: ["geopathic rod", "earth radiation", "hartmann grid", "brass rod", "sleep remedy"],
    specifications: [
      { label: "Material", value: "Engineered Solid Brass" },
      { label: "Function", value: "Geopathic Stress Wave Reversal" },
      { label: "Placement", value: "Along Bed Frame, Floor Joists, or Entryway" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.16.48 PM.jpeg",
    title: "Sacred Brass Ashoka Pillar (अशोक स्तम्भ / Ashoka Stambha)",
    category: "Pyramids & Yantras",
    shortDescription: "Regal 4-lion brass Ashoka Stambha symbolizing sovereign authority, government favor, and triumph in disputes.",
    description: "Meticulously cast in solid antique brass featuring the four majestic lions atop the Ashoka Dharma Chakra base with 'सत्यमेव जयते' inscription. Placed in the North-Northwest or North zone, it boosts government contracts, bureaucratic approvals, social stature, and undeniable respect.",
    regularPrice: 2799,
    salePrice: 1899,
    featured: true,
    tags: ["ashoka pillar", "ashoka stambha", "brass idol", "authority", "government favor", "prestige"],
    specifications: [
      { label: "Material", value: "Pure Cast Brass with Antique Gold Finish" },
      { label: "Height", value: "Approx. 9 Inches" },
      { label: "Placement", value: "North / North-Northwest (NNW)" },
      { label: "Inscribed", value: "Satyameva Jayate" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.17.36 PM.jpeg",
    title: "Panch Tatva 5 Elements Essential Oil Set (5 x 15ml)",
    category: "Oils & Sprays",
    shortDescription: "Complete set of 5 elemental oils (Air, Fire, Water, Earth, Space) to balance all residential directions.",
    description: "Vastu Shastra is fundamentally the harmonious equilibrium of the Five Great Elements (Panch Mahabhuta). This collector box contains five specialized 15ml essential oil formulas: Vayu (Air - East), Agni (Fire - Southeast), Jala (Water - North/NE), Prithvi (Earth - Southwest), and Akasha (Space - Center/West).",
    regularPrice: 3499,
    salePrice: 2299,
    featured: true,
    tags: ["panch tatva", "five elements", "essential oils set", "air fire water earth space", "complete set"],
    specifications: [
      { label: "Contents", value: "5 Bottles x 15ml Each" },
      { label: "Elements", value: "Air, Fire, Water, Earth, Space" },
      { label: "Use", value: "Diffuser & Directional Energization" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.18.05 PM.jpeg",
    title: "Ashta Disha 8 Directions Vastu Balancing Essential Oil Set (8 x 15ml)",
    category: "Oils & Sprays",
    shortDescription: "Master set of 8 direction-specific remedy oils: NE, SE, SW, NW, South, North, East, and West.",
    description: "The ultimate diagnostic and remedy collection for serious Vastu practitioners and homeowners. Includes eight custom botanical formulations engineered specifically to feed, calm, or boost the unique elemental qualities of all eight cardinal and ordinal compass directions.",
    regularPrice: 4999,
    salePrice: 3499,
    featured: true,
    tags: ["ashta disha", "8 directions", "vastu set", "essential oils", "compass remedies", "complete set"],
    specifications: [
      { label: "Contents", value: "8 Bottles x 15ml Each" },
      { label: "Directions", value: "Northeast, Southeast, Southwest, Northwest, North, South, East, West" },
      { label: "Use", value: "Aroma diffusion in corresponding direction" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.19.05 PM.jpeg",
    title: "Sacred Vastu Dosh Nivarak Powder (वास्तु दोष निवारक चूर्ण 500g)",
    category: "Purification & Salts",
    shortDescription: "Sacred energized herbal mineral powder for houses, offices, and factories to dispel negative energy fields.",
    description: "A venerable traditional blend of consecrated forest herbs, sacred soil from holy pilgrimage sites, and purifying minerals. Scatter a small pinch in room corners, main entrance threshold, or mix with floor cleaning water to banish dark, heavy etheric vibrations.",
    regularPrice: 999,
    salePrice: 699,
    featured: false,
    tags: ["vastu powder", "dosh nivarak", "churna", "purification", "negative energy cleanser"],
    specifications: [
      { label: "Net Weight", value: "500g Pack" },
      { label: "Application", value: "Threshold dusting / Floor mopping addition" },
      { label: "Suitability", value: "Home, Office, Factory, Warehouse" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.19.47 PM.jpeg",
    title: "Bio-Defence Quantum Energy Protection Blend (15ml)",
    category: "Aura & Quantum Healing",
    shortDescription: "High-potency quantum-infused botanical blend providing an energetic bio-field defense shield.",
    description: "Infused with subtle subatomic scalar and quantum frequencies. Designed to defend human cellular energy against electromagnetic smog (EMF), 5G towers, wifi static, and environmental geopathic toxins.",
    regularPrice: 1299,
    salePrice: 849,
    featured: true,
    tags: ["bio defence", "quantum energy", "emf shield", "protection blend", "essential oil"],
    specifications: [
      { label: "Volume", value: "15ml" },
      { label: "Technology", value: "Infused with Quantum Energy Frequencies" },
      { label: "Use", value: "Aura misting / Diffuser" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.20.24 PM.jpeg",
    title: "Divine Protection Aura Essential Oil (15ml)",
    category: "Oils & Sprays",
    shortDescription: "Sacred spiritual armor essential oil to seal the personal aura against nazar, jealousy, and psychic attack.",
    description: "Distilled from ancient protective resins including myrrh, guggul, camphor, and holy basil. Apply a drop to the crown and heart chakra to reinforce an impenetrable shield of divine white light around you.",
    regularPrice: 1199,
    salePrice: 799,
    featured: false,
    tags: ["divine protection", "aura oil", "nazar suraksha", "essential oil", "spiritual shield"],
    specifications: [
      { label: "Volume", value: "15ml" },
      { label: "Ingredients", value: "Guggul, Loban, Tulsi, Frankincense" },
      { label: "Use", value: "Aura anointing & Meditation" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.20.59 PM.jpeg",
    title: "Navgrah Shanti 9 Planets Sacred Essential Oil (15ml)",
    category: "Navagraha Remedies",
    shortDescription: "Universal harmonic oil blend consecrated to placate all 9 astrological planets simultaneously.",
    description: "Carefully calibrated with nine sacred wood herbs representing Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu. Diffuse daily during morning prayers to cultivate all-round astrological peace, luck, and household harmony.",
    regularPrice: 1299,
    salePrice: 899,
    featured: true,
    tags: ["navgrah oil", "9 planets", "shanti oil", "astrology remedy", "essential oil"],
    specifications: [
      { label: "Volume", value: "15ml" },
      { label: "Planetary Scope", value: "All 9 Navagrahas Harmonized" },
      { label: "Use", value: "Puja Room Diffuser / Daily Oil Burner" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.21.59 PM (1).jpeg",
    title: "ZoinnR Quantum Infused Energy Oil (15ml)",
    category: "Aura & Quantum Healing",
    shortDescription: "Ultra-pure quantum calibrated bio-energy oil to revitalize low body frequency and sluggish spaces.",
    description: "Formulated using advanced proprietary bio-frequency resonance technology. Recharges drained vitality, assists in rapid mental rejuvenation, and establishes a serene sanctuary in modern bustling homes.",
    regularPrice: 1299,
    salePrice: 849,
    featured: false,
    tags: ["zoinnr", "quantum energy", "vitality oil", "bio frequency", "essential oil"],
    specifications: [
      { label: "Volume", value: "15ml" },
      { label: "Formulation", value: "Quantum Energy Infusion" },
      { label: "Use", value: "Inhalation / Room Diffuser" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.21.59 PM.jpeg",
    title: "BrainPWR Focus, Memory & Clarity Quantum Blend (15ml)",
    category: "Aura & Quantum Healing",
    shortDescription: "Nootropic aromatic essential blend supporting laser-sharp focus, deep memory recall, and mental agility.",
    description: "Formulated with rosemary, gotu kola, and peppermint charged with cognitive quantum resonance frequencies. Ideal for software engineers, traders, executives, and academics demanding sustained intellectual clarity without fatigue.",
    regularPrice: 1399,
    salePrice: 949,
    featured: true,
    tags: ["brainpwr", "focus", "memory", "clarity", "nootropic", "quantum blend"],
    specifications: [
      { label: "Volume", value: "15ml" },
      { label: "Benefit", value: "Memory, Analytical Clarity, Anti Brain-Fog" },
      { label: "Use", value: "Desk Diffuser / Palm Inhalation" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.25.29 PM (1).jpeg",
    title: "Kitchen Protector Vastu Fire & Energy Balancer Strip Box",
    category: "Protective Strips",
    shortDescription: "Geometric energetic strip box neutralizing fire-water clashes and kitchen placement doshas.",
    description: "Enclosing sacred multi-colored geometric pyramid matrices designed to nullify the harmful energy of kitchens built in the North, Northeast, or Southwest. Mount above the stove or behind the kitchen door to protect family health.",
    regularPrice: 1699,
    salePrice: 1199,
    featured: false,
    tags: ["kitchen protector", "energy strip", "fire element", "kitchen vastu", "pyramid box"],
    specifications: [
      { label: "Type", value: "Pre-energized Vastu Barrier Strip Box" },
      { label: "Application", value: "Kitchen Wall / Stove Zone" },
      { label: "Remedy Type", value: "Non-destructive Vastu Correction" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.25.29 PM (2).jpeg",
    title: "Door Protector Main Entrance Dosh Nivaran Energy Strip Box",
    category: "Protective Strips",
    shortDescription: "Auspicious golden entrance protection strip blocking incoming negative energy and evil eye at the threshold.",
    description: "Your main doorway governs how opportunities and wealth enter. This consecrated Door Protector strip with sacred sacred geometry shields against negative foot traffic, road hits (Veedhi Shoola), and opposing door defects.",
    regularPrice: 1699,
    salePrice: 1199,
    featured: true,
    tags: ["door protector", "entrance vastu", "threshold shield", "energy strip", "main door"],
    specifications: [
      { label: "Type", value: "Threshold / Door Header Vastu Strip Box" },
      { label: "Application", value: "Main Door Frame (Top or Bottom)" },
      { label: "Remedy Type", value: "Non-destructive Vastu Correction" }
    ]
  },
  {
    file: "WhatsApp Image 2026-11-01 at 8.25.29 PM.jpeg",
    title: "Toilet Protector Vastu Energy Neutralizer Strip Box",
    category: "Protective Strips",
    shortDescription: "Essential energetic boundary strip sealing draining negative vortexes generated by incorrect toilets.",
    description: "An easy-to-install, highly effective remedy for toilets located in prosperity-killing directions. It installs flat against the washroom door or threshold, actively barricading low-vibrational drainage fields from contaminating the rest of the residence.",
    regularPrice: 1699,
    salePrice: 1199,
    featured: true,
    tags: ["toilet protector", "bathroom vastu", "drainage seal", "energy strip", "neutralizer"],
    specifications: [
      { label: "Type", value: "Toilet Dosh Neutralizer Strip Box" },
      { label: "Application", value: "Toilet Door Frame / Outer Wall" },
      { label: "Remedy Type", value: "Non-destructive Vastu Correction" }
    ]
  }
];

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const finalProducts = productsMeta.map((item, index) => {
  const uploadInfo = uploads[item.file] || {};
  const skuNum = String(index + 1).padStart(3, '0');
  const slug = generateSlug(item.title);
  const now = new Date();

  return {
    title: item.title,
    slug: slug,
    description: item.description,
    shortDescription: item.shortDescription,
    category: item.category,
    sku: `BSV-PRD-${skuNum}`,
    regularPrice: item.regularPrice,
    salePrice: item.salePrice,
    currency: "INR",
    priceNeedsReview: false,
    stock: Math.floor(Math.random() * 40) + 60, // 60 to 99 in stock
    stockStatus: "in_stock",
    trackInventory: true,
    images: [
      {
        url: uploadInfo.url || "",
        alt: item.title,
        publicId: uploadInfo.publicId || null,
      }
    ],
    status: "published",
    featured: item.featured,
    tags: item.tags,
    specifications: item.specifications,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
});

fs.writeFileSync(
  'C:/Users/tsoni/Desktop/vastu/products_import.json',
  JSON.stringify(finalProducts, null, 2),
  'utf8'
);

console.log(`Generated products_import.json with ${finalProducts.length} products!`);
