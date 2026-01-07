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
    Gift, Shield
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
export const categoryIcons = {
    'food': { icon: Utensils, label: 'Food' },
    'apple': { icon: Apple, label: 'Groceries' },
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
};

export const getIconComponent = (key) => {
    return categoryIcons[key]?.icon || Utensils;
}
