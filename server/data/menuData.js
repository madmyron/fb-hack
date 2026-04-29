const menu = [
  {
    id: 'food',
    category: 'Food',
    items: [
      { id: 'f1', name: 'Loaded Nachos', description: 'Tortilla chips, cheese, jalapeños, salsa, sour cream', price: 14.00, tag: 'food' },
      { id: 'f2', name: 'Buffalo Wings', description: '10 wings, choice of sauce, ranch or blue cheese', price: 16.00, tag: 'food' },
      { id: 'f3', name: 'Smash Burger', description: 'Double smash patty, american cheese, pickles, special sauce', price: 18.00, tag: 'food' },
      { id: 'f4', name: 'BBQ Pulled Pork Sandwich', description: 'Slow-cooked pork, coleslaw, brioche bun', price: 15.00, tag: 'food' },
      { id: 'f5', name: 'Caesar Salad', description: 'Romaine, parmesan, croutons, caesar dressing', price: 12.00, tag: 'food' },
      { id: 'f6', name: 'Truffle Fries', description: 'Hand-cut fries, truffle oil, parmesan, herbs', price: 10.00, tag: 'food' },
      { id: 'f7', name: 'Margherita Pizza', description: '12" pizza, tomato, fresh mozzarella, basil', price: 17.00, tag: 'food' },
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
      { id: 'c1', name: 'Classic Margarita', description: 'Tequila, lime, triple sec, salt rim', price: 13.00, tag: 'drink' },
      { id: 'c2', name: 'Old Fashioned', description: 'Bourbon, bitters, sugar, orange peel', price: 14.00, tag: 'drink' },
      { id: 'c3', name: 'Mojito', description: 'Rum, mint, lime, soda', price: 13.00, tag: 'drink' },
      { id: 'c4', name: 'Aperol Spritz', description: 'Aperol, prosecco, soda, orange', price: 13.00, tag: 'drink' },
      { id: 'c5', name: 'Cosmopolitan', description: 'Vodka, cranberry, lime, triple sec', price: 14.00, tag: 'drink' },
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
