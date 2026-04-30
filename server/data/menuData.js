const menu = [
  {
    id: 'happyhour',
    category: 'Happy Hour',
    banner: { text: 'Happy Hour Menu', hours: '3:00 PM – 7:00 PM', note: 'Discounted drinks & bites every day!' },
    items: [
      { id: 'hh1', name: 'Draft Beer', description: 'Any draft on tap — 16oz', price: 5.00, tag: 'drink', badge: 'reg $7–8' },
      { id: 'hh2', name: 'House Wine', description: 'Red, white, or rosé — 6oz', price: 8.00, tag: 'drink', badge: 'reg $11–12' },
      { id: 'hh3', name: 'Well Cocktails', description: 'Margarita, Mojito, Vodka Soda, Gin & Tonic', price: 8.00, tag: 'drink', badge: 'reg $13' },
      { id: 'hh4', name: 'Half-Price Nachos', description: 'Tortilla chips, cheese, jalapeños, salsa, sour cream', price: 7.00, tag: 'food', badge: 'reg $14' },
      { id: 'hh5', name: 'Half-Price Wings', description: 'Choice of 6 or 12 wings, choice of sauce', price: 8.00, tag: 'food', badge: 'reg $16', options: [
        { id: 'qty', label: 'Amount', type: 'select', required: true, choices: ['6 Wings', '12 Wings'] },
        { id: 'sauce', label: 'Sauce', type: 'select', required: true, choices: ['Buffalo', 'BBQ', 'Honey Garlic', 'Ranch', 'Dry Rub'] },
        { id: 'heat', label: 'Heat Level', type: 'select', required: false, choices: ['Mild', 'Medium', 'Hot', 'Extra Hot'] },
        { id: 'sos', label: 'Sauce on Side', type: 'toggle', required: false },
        { id: 'notes', label: 'Special Instructions', type: 'text', required: false },
      ] },
      { id: 'hh6', name: 'Half-Price Truffle Fries', description: 'Hand-cut fries, truffle oil, parmesan', price: 5.00, tag: 'food', badge: 'reg $10' },
    ],
  },
  {
    id: 'specials',
    category: 'Specials',
    banner: { text: "Today's Specials", hours: 'Limited availability', note: 'Fresh picks from the kitchen.' },
    items: [
      { id: 's1', name: "Chef's Burger", description: 'Wagyu patty, truffle aioli, brie, caramelized onion, brioche bun', price: 22.00, tag: 'food', badge: "Chef's Pick" },
      { id: 's2', name: 'Catch of the Day', description: 'Pan-seared fish, seasonal vegetables, lemon butter sauce — ask your server for today\'s fish', price: 26.00, tag: 'food', badge: 'Daily Special' },
      { id: 's3', name: 'Espresso Martini', description: 'Vodka, espresso, coffee liqueur, vanilla — shaken hard', price: 14.00, tag: 'drink', badge: 'Featured' },
      { id: 's4', name: 'Seasonal Sangria', description: 'House red, fresh fruit, brandy, citrus juice — pitcher or glass', price: 13.00, tag: 'drink', badge: 'Featured' },
      { id: 's5', name: 'Loaded Quesadilla', description: 'Pulled pork, cheddar, jalapeños, chipotle crema', price: 15.00, tag: 'food', badge: 'New' },
    ],
  },
  {
    id: 'food',
    category: 'Food',
    items: [
      { id: 'f1', name: 'Loaded Nachos', description: 'Tortilla chips, cheese, jalapeños, salsa, sour cream', price: 14.00, tag: 'food' },
      { id: 'f2', name: 'Buffalo Wings', description: 'Choice of 6 or 12 wings, choice of sauce, ranch or blue cheese', price: 16.00, tag: 'food', options: [
        { id: 'qty', label: 'Amount', type: 'select', required: true, choices: ['6 Wings', '12 Wings'] },
        { id: 'sauce', label: 'Sauce', type: 'select', required: true, choices: ['Buffalo', 'BBQ', 'Honey Garlic', 'Ranch', 'Dry Rub'] },
        { id: 'heat', label: 'Heat Level', type: 'select', required: false, choices: ['Mild', 'Medium', 'Hot', 'Extra Hot'] },
        { id: 'sos', label: 'Sauce on Side', type: 'toggle', required: false },
        { id: 'notes', label: 'Special Instructions', type: 'text', required: false },
      ] },
      { id: 'f3', name: 'Smash Burger', description: 'Double smash patty, american cheese, pickles, special sauce', price: 18.00, tag: 'food', options: [
        { id: 'doneness', label: 'Doneness', type: 'select', required: true, choices: ['Medium Rare', 'Medium', 'Medium Well', 'Well Done'] },
        { id: 'notes', label: 'Special Instructions', type: 'text', required: false },
      ] },
      { id: 'f4', name: 'BBQ Pulled Pork Sandwich', description: 'Slow-cooked pork, coleslaw, brioche bun', price: 15.00, tag: 'food' },
      { id: 'f5', name: 'Caesar Salad', description: 'Romaine, parmesan, croutons, caesar dressing', price: 12.00, tag: 'food', options: [
        { id: 'protein', label: 'Add Protein', type: 'select', required: false, choices: ['No Add-On', 'Grilled Chicken +$4', 'Shrimp +$5'] },
        { id: 'notes', label: 'Special Instructions', type: 'text', required: false },
      ] },
      { id: 'f6', name: 'Truffle Fries', description: 'Hand-cut fries, truffle oil, parmesan, herbs', price: 10.00, tag: 'food' },
      { id: 'f7', name: 'Margherita Pizza', description: '12" pizza, tomato, fresh mozzarella, basil', price: 17.00, tag: 'food', options: [
        { id: 'crust', label: 'Crust', type: 'select', required: false, choices: ['Thin', 'Regular', 'Thick'] },
        { id: 'notes', label: 'Extra Toppings / Notes', type: 'text', required: false },
      ] },
      { id: 'f8', name: 'Chocolate Brownie', description: 'Warm brownie, vanilla ice cream, chocolate sauce', price: 9.00, tag: 'food' },
    ],
  },
  {
    id: 'beer',
    category: 'Beer',
    items: [
      { id: 'b1', name: 'Draft Lager', description: 'Light and crisp, 5% ABV — 16oz', price: 7.00, tag: 'drink' },
      { id: 'b2', name: 'IPA', description: 'Hoppy and bold, 6.5% ABV — 16oz', price: 8.00, tag: 'drink' },
      { id: 'b3', name: 'Stout', description: 'Dark and rich, 5.5% ABV — 16oz', price: 8.00, tag: 'drink' },
      { id: 'b4', name: 'Seasonal Draft', description: 'Ask your server — 16oz', price: 8.00, tag: 'drink' },
    ],
  },
  {
    id: 'cocktails',
    category: 'Cocktails',
    items: [
      { id: 'c1', name: 'Classic Margarita', description: 'Tequila, lime, triple sec, salt rim', price: 13.00, tag: 'drink', options: [
        { id: 'style', label: 'Style', type: 'select', required: false, choices: ['On the Rocks', 'Frozen'] },
        { id: 'rim', label: 'Rim', type: 'select', required: false, choices: ['Salt', 'No Salt', 'Sugar'] },
      ] },
      { id: 'c2', name: 'Old Fashioned', description: 'Bourbon, bitters, sugar, orange peel', price: 14.00, tag: 'drink', options: [
        { id: 'bourbon', label: 'Bourbon', type: 'select', required: false, choices: ["Maker's Mark", 'Bulleit', 'Woodford Reserve', 'Jim Beam'] },
      ] },
      { id: 'c3', name: 'Mojito', description: 'Rum, mint, lime, soda', price: 13.00, tag: 'drink', options: [
        { id: 'extras', label: 'Extras', type: 'select', required: false, choices: ['None', 'Extra Mint', 'Extra Lime', 'Extra Mint & Lime'] },
      ] },
      { id: 'c4', name: 'Aperol Spritz', description: 'Aperol, prosecco, soda, orange', price: 13.00, tag: 'drink' },
      { id: 'c5', name: 'Cosmopolitan', description: 'Vodka, cranberry, lime, triple sec', price: 14.00, tag: 'drink' },
    ],
  },
  {
    id: 'winelist',
    category: 'Wine List',
    items: [
      { id: 'wl1', name: 'Caymus Cabernet Sauvignon', description: 'Napa Valley — bold, dark fruit, full body — bottle', price: 95.00, tag: 'drink' },
      { id: 'wl2', name: 'Kim Crawford Sauvignon Blanc', description: 'New Zealand — crisp, citrus, refreshing — bottle', price: 45.00, tag: 'drink' },
      { id: 'wl3', name: 'La Marca Prosecco', description: 'Italy — light bubbles, honeydew, cream — bottle', price: 38.00, tag: 'drink' },
      { id: 'wl4', name: 'Malbec', description: 'Argentina — plum, dark cherry, smooth tannins — 6oz', price: 13.00, tag: 'drink' },
      { id: 'wl5', name: 'Chardonnay', description: 'California — buttery, oak, green apple — 6oz', price: 12.00, tag: 'drink' },
      { id: 'wl6', name: 'Sauvignon Blanc', description: 'New Zealand — bright, crisp, tropical — 6oz', price: 12.00, tag: 'drink' },
      { id: 'wl7', name: 'Pinot Noir', description: 'Oregon — earthy, cherry, silky finish — 6oz', price: 14.00, tag: 'drink' },
      { id: 'wl8', name: 'Prosecco by the Glass', description: 'La Marca — bubbles, light, festive — 6oz', price: 12.00, tag: 'drink' },
    ],
  },
  {
    id: 'wine',
    category: 'Wine',
    items: [
      { id: 'w1', name: 'House Red', description: 'Cabernet Sauvignon, bold and dry — 6oz', price: 11.00, tag: 'drink' },
      { id: 'w2', name: 'House White', description: 'Pinot Grigio, crisp and light — 6oz', price: 11.00, tag: 'drink' },
      { id: 'w3', name: 'Rosé', description: 'Dry rosé, French — 6oz', price: 12.00, tag: 'drink' },
    ],
  },
  {
    id: 'na',
    category: 'Non-Alcoholic',
    items: [
      { id: 'n1', name: 'Soft Drink', description: 'Coke, Diet Coke, Sprite, Ginger Ale', price: 4.00, tag: 'drink' },
      { id: 'n2', name: 'Sparkling Water', description: 'San Pellegrino — 500ml', price: 5.00, tag: 'drink' },
      { id: 'n3', name: 'Fresh Lemonade', description: 'House-made, mint optional', price: 6.00, tag: 'drink' },
      { id: 'n4', name: 'Coffee', description: 'Espresso, Americano, Latte, Cappuccino', price: 5.00, tag: 'drink' },
    ],
  },
];

module.exports = menu;
