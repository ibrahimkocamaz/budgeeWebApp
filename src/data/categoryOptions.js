import {
    Apple, Utensils, Coffee, Wine,
    Bus, Train, Car, Fuel,
    Home, Wifi, Zap,
    Heart, Activity,
    Film, Music, Gamepad2,
    Book, Smartphone, Laptop,
    Calculator, ShoppingBag, Briefcase,
    Dog, Cat,
    Leaf, Sun, MapPin,
    Palette, Camera, Lightbulb,
    Dumbbell, GraduationCap, Plane,
    Gift, Shield, ShoppingCart,
    // Food & Drink
    Pizza, Beer, CupSoda, Cake, IceCream, Carrot, Beef, Fish,
    // Transport
    Bike, Ship, CircleParking, Ticket, Wrench,
    // Home & Living
    Bed, Bath, Sofa, Tv, Trash,
    // Activities & Fun
    Baby, Trophy, TicketPercent, PartyPopper,
    // Nature & Outdoors
    TreePine, Flower2, CloudRain, Flame, Mountain,
    // Health & Personal
    Pill, Stethoscope, Brain, Shirt, Scissors,
    // Tech & Office
    Mouse, Printer, Headphones, Watch, Paperclip, Folder,
    // Finance & Misc
    CreditCard, Wallet, Banknote, PiggyBank,
    Landmark, TrendingUp, Receipt
} from 'lucide-react';

export const availableColors = [
    '#8E44AD', '#16A085', '#7F8C8D', '#D35400', '#2C3E50',
    '#27AE60', '#F1C40F', '#34495E', '#E67E22', '#1ABC9C',
    '#C0392B', '#6D214F', '#82589F', '#182C61', '#FC427B',
    '#BDC581', '#58B19F', '#9AECDB', '#FD7272', '#778CA3',
    '#2C3A47', '#B33771', '#40407A', '#706FD3', '#474787',
    '#227093', '#218F76', '#84817A', '#FAB1A0', '#FF6B6B',
    '#4ECDC4', '#FF9A8B', '#FFD166', '#3A86FF', '#8338EC',
    '#FB5607', '#FFBE0B', '#06D6A0', '#EF476F', '#FF101F',
    '#8970FF', '#61EAFD', '#7FC8A9', '#DAA520', '#BA55D3',
    '#556B2F', '#A93226', '#5D6D7E', '#CD6155', '#5499C7',
    '#48C9B0', '#52BE80', '#F4D03F', '#E59866', '#EC7063',
    '#7DCEA0', '#5DADE2', '#AF7AC5', '#F5B041',
];

// Mapping of ID to Lucide Component
// Mapping of ID to Lucide Component
export const pickerIcons = {
    'food': { icon: Apple, label: 'Food' },
    'groceries': { icon: ShoppingCart, label: 'Groceries' },
    'coffee': { icon: Coffee, label: 'Coffee' },
    'wine': { icon: Wine, label: 'Drinks' },
    'bus': { icon: Bus, label: 'Bus' },
    'train': { icon: Train, label: 'Train' },
    'car': { icon: Car, label: 'Car' },
    'fuel': { icon: Fuel, label: 'Fuel' },
    'home': { icon: Home, label: 'Housing' },
    'wifi': { icon: Wifi, label: 'Internet' },
    'zap': { icon: Zap, label: 'Utilities' },
    'heart': { icon: Heart, label: 'Health' },
    'activity': { icon: Activity, label: 'Fitness' },
    'film': { icon: Film, label: 'Entertainment' },
    'music': { icon: Music, label: 'Music' },
    'game': { icon: Gamepad2, label: 'Games' },
    'book': { icon: Book, label: 'Books' },
    'tech': { icon: Laptop, label: 'Tech' },
    'mobile': { icon: Smartphone, label: 'Mobile' },
    'finance': { icon: Calculator, label: 'Finance' },
    'job': { icon: Briefcase, label: 'Work' },
    'shopping': { icon: ShoppingBag, label: 'Shopping' },
    'pet': { icon: Dog, label: 'Pets' },
    'cat': { icon: Cat, label: 'Cat' },
    'nature': { icon: Leaf, label: 'Nature' },
    'weather': { icon: Sun, label: 'Weather' },
    'map': { icon: MapPin, label: 'Location' },
    'art': { icon: Palette, label: 'Art' },
    'camera': { icon: Camera, label: 'Photo' },
    'idea': { icon: Lightbulb, label: 'Idea' },
    'gym': { icon: Dumbbell, label: 'Gym' },
    'edu': { icon: GraduationCap, label: 'Education' },
    'travel': { icon: Plane, label: 'Travel' },
    'gift': { icon: Gift, label: 'Gift' },
    'security': { icon: Shield, label: 'Security' },

    // Food & Drink Extras
    'pizza': { icon: Pizza, label: 'Pizza' },
    'beer': { icon: Beer, label: 'Alcohol' },
    'soda': { icon: CupSoda, label: 'Soft Drink' },
    'cake': { icon: Cake, label: 'Dessert' },
    'icecream': { icon: IceCream, label: 'Ice Cream' },
    'carrot': { icon: Carrot, label: 'Vegetables' },
    'beef': { icon: Beef, label: 'Meat' },
    'fish': { icon: Fish, label: 'Seafood' },

    // Transport Extras
    'bike': { icon: Bike, label: 'Cycling' },
    'ship': { icon: Ship, label: 'Cruise/Boat' },
    'parking': { icon: CircleParking, label: 'Parking' },
    'service': { icon: Wrench, label: 'Service' },
    'ticket': { icon: Ticket, label: 'Ticket' },

    // Home
    'furniture': { icon: Sofa, label: 'Furniture' },
    'bed': { icon: Bed, label: 'Lodging' },
    'tv': { icon: Tv, label: 'TV' },
    'bath': { icon: Bath, label: 'Bathroom' },
    'trash': { icon: Trash, label: 'Waste' },

    // Fun & Activities
    'baby': { icon: Baby, label: 'Child' },
    'party': { icon: PartyPopper, label: 'Party' },
    'ticket-percent': { icon: TicketPercent, label: 'Voucher' },
    'trophy': { icon: Trophy, label: 'Win' },

    // Nature
    'tree': { icon: TreePine, label: 'Forest' },
    'flower': { icon: Flower2, label: 'Garden' },
    'rain': { icon: CloudRain, label: 'Rain' },
    'fire': { icon: Flame, label: 'Gas/Heat' },
    'mountain': { icon: Mountain, label: 'Hiking' },

    // Health / Personal
    'pill': { icon: Pill, label: 'Pharmacy' },
    'doctor': { icon: Stethoscope, label: 'Doctor' },
    'brain': { icon: Brain, label: 'Learn' },
    'clothes': { icon: Shirt, label: 'Clothing' },
    'cut': { icon: Scissors, label: 'Barber' },

    // Tech
    'mouse': { icon: Mouse, label: 'Peripherals' },
    'print': { icon: Printer, label: 'Print' },
    'audio': { icon: Headphones, label: 'Audio' },
    'watch': { icon: Watch, label: 'Accessories' },

    // Finance / Office
    'cash': { icon: Banknote, label: 'Cash' },
    'card': { icon: CreditCard, label: 'Card' },
    'wallet': { icon: Wallet, label: 'Wallet' },
    'savings': { icon: PiggyBank, label: 'Savings' },
    'office': { icon: Folder, label: 'Office' },
    'paper': { icon: Paperclip, label: 'Supplies' },
    'tax': { icon: Landmark, label: 'Tax/Bank' },
    'invest': { icon: TrendingUp, label: 'Invest' },
    'bill': { icon: Receipt, label: 'Bill' },
};

export const categoryIcons = {
    ...pickerIcons,
    // Aliases for backward compatibility / robustness
    'utensils': { icon: Utensils, label: 'Food' },
    'apple': { icon: Apple, label: 'Groceries' },
    'transport': { icon: Car, label: 'Transport' },
    'housing': { icon: Home, label: 'Housing' },
    'entertainment': { icon: Film, label: 'Entertainment' },
    'salary': { icon: Calculator, label: 'Salary' },
};

export const getCategoryIcon = (key) => {
    return categoryIcons[key?.toLowerCase()]?.icon || Utensils;
}

export const getCategoryColor = (key) => {
    // Generate a consistent color based on string char code if not found, or use a default
    // For now, let's map known categories or return a random one from availableColors deterministically
    if (!key) return availableColors[0];
    const index = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return availableColors[index % availableColors.length];
}
