import { Restaurant, MenuItem, ModifierGroup } from '@/types';

export const SIDECAR_RESTAURANT: Restaurant = {
  id: 'rest_sidecar_01',
  name: 'Sidecar Pizza Co.',
  concept: 'High-Volume Artisan Pizzeria & Fast Casual Tavern',
  posType: 'MOCK_POS_V2',
  hours: {
    openHour: 11, // 11:00 AM
    closeHour: 22, // 10:00 PM
  },
  deliveryZones: {
    zipCodes: ['97201', '97202', '97204', '97205', '97209', '97214'],
    maxRadiusMiles: 6.5,
  },
  allergensPolicy: {
    strictEscalation: true,
    disclaimer:
      'Our kitchen uses tree nuts, peanuts, dairy, wheat, and eggs. We do not maintain separate allergen-isolated fryers or ovens. For tree nut or severe allergies, staff verification is mandatory.',
  },
};

export const SIDECAR_MODIFIER_GROUPS: ModifierGroup[] = [
  {
    id: 'mg_burger_toppings',
    name: 'Burger Toppings & Produce',
    minSelect: 0,
    maxSelect: 10,
    options: [
      { id: 'mod_extra_pickles', name: 'Extra Pickles', priceDelta: 0.75, isDefault: false },
      { id: 'mod_no_onions', name: 'Onions', priceDelta: 0.0, isDefault: true },
      { id: 'mod_no_lettuce', name: 'Lettuce', priceDelta: 0.0, isDefault: true },
      { id: 'mod_no_tomato', name: 'Tomato', priceDelta: 0.0, isDefault: true },
      { id: 'mod_bacon', name: 'Smoked Bacon', priceDelta: 2.5, isDefault: false },
      { id: 'mod_extra_cheese', name: 'Extra Aged Cheddar', priceDelta: 1.5, isDefault: false },
    ],
  },
  {
    id: 'mg_pizza_toppings',
    name: 'Pizza Toppings',
    minSelect: 0,
    maxSelect: 8,
    options: [
      { id: 'mod_top_pepperoni', name: 'Pepperoni', priceDelta: 2.25 },
      { id: 'mod_top_mushroom', name: 'Cremini Mushrooms', priceDelta: 1.75 },
      { id: 'mod_top_sausage', name: 'Fennel Sausage', priceDelta: 2.25 },
      { id: 'mod_top_olives', name: 'Black Olives', priceDelta: 1.5 },
      { id: 'mod_top_basil', name: 'Fresh Basil', priceDelta: 1.0 },
    ],
  },
  {
    id: 'mg_pizza_crust',
    name: 'Pizza Crust & Style',
    minSelect: 1,
    maxSelect: 1,
    options: [
      { id: 'mod_crust_crispy_thin', name: 'Crispy Thin', priceDelta: 0.0, isDefault: true },
      { id: 'mod_crust_detroit', name: 'Detroit Pan', priceDelta: 3.5 },
      { id: 'mod_crust_gf', name: 'Gluten-Free Crust', priceDelta: 4.0 },
    ],
  },
];

export const SIDECAR_MENU_ITEMS: MenuItem[] = [
  {
    id: 'item_cheeseburger_dbl',
    name: 'Double Cheeseburger',
    category: 'burger',
    basePrice: 14.5,
    available: true,
    modifierGroupIds: ['mg_burger_toppings'],
    allergens: ['dairy', 'wheat', 'sesame'],
    description:
      'Two 4oz grass-fed smash patties, aged sharp cheddar, caramelized onions, house dill pickles, and special sauce on a toasted potato roll.',
  },
  {
    id: 'item_pizza_large_custom',
    name: 'Large 16" Custom Pizza',
    category: 'pizza',
    basePrice: 21.0,
    available: true,
    modifierGroupIds: ['mg_pizza_toppings', 'mg_pizza_crust'],
    allergens: ['wheat', 'dairy'],
    description:
      '16-inch signature fermented sourdough crust, crushed San Marzano tomato sauce, whole milk mozzarella. Supports half-and-half topping distributions.',
  },
  {
    id: 'item_lunch_special_slice_combo',
    name: 'Lunch Special: 2 Slices & Soda',
    category: 'special',
    basePrice: 9.95,
    available: true,
    availabilityWindow: {
      startHour: 11, // 11:00 AM
      endHour: 15,   // 3:00 PM (15:00)
    },
    modifierGroupIds: [],
    allergens: ['wheat', 'dairy'],
    description:
      'Two daily choice slices and a fountain beverage. Available strictly between 11:00 AM and 3:00 PM Monday through Friday.',
  },
  {
    id: 'item_pesto_genovese_panini',
    name: 'Rustic Pesto Mozzarella Sandwich',
    category: 'sandwich',
    basePrice: 13.0,
    available: true,
    modifierGroupIds: [],
    allergens: ['tree nuts (pine nuts / walnuts - cross-contact warning)', 'dairy', 'wheat'],
    description:
      'Warm ciabatta, fresh buffalo mozzarella, heirloom tomato, balsamic reduction, and house Genovese basil pesto prepared with pine nuts and walnuts.',
  },
  {
    id: 'item_caesar_salad',
    name: 'Sidecar Caesar Salad',
    category: 'salad',
    basePrice: 10.5,
    available: true,
    modifierGroupIds: [],
    allergens: ['fish (anchovy)', 'egg', 'dairy', 'wheat'],
    description: 'Crisp romaine hearts, sourdough croutons, shaved parmigiano reggiano, and lemon-anchovy dressing.',
  },
  {
    id: 'item_craft_soda',
    name: 'Maine Root Artisan Soda',
    category: 'beverage',
    basePrice: 3.5,
    available: true,
    modifierGroupIds: [],
    allergens: [],
    description: 'Fair-trade cane sugar soda: Mexicane Cola, Lemon-Lime, or Ginger Brew.',
  },
];
