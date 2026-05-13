import mongoose from 'mongoose';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.split('=').map(s => s.trim()))
    .map(([k, ...v]) => [k, v.join('=')])
);

const uri = env.MONGODB_URI;

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  available: { type: Boolean, default: true },
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

const products = [
  {
    name: 'Empanadas x12',
    description: 'Docena de empanadas caseras. Rellenos a elección: carne, pollo o jamón y queso.',
    price: 4800,
    image: 'http://localhost:3001/empanada.svg',
    category: 'comida',
    available: true,
  },
  {
    name: 'Torta de chocolate',
    description: 'Torta húmeda de chocolate con ganache y decoración artesanal. Para 10 porciones.',
    price: 12500,
    image: 'http://localhost:3001/torta.svg',
    category: 'repostería',
    available: true,
  },
  {
    name: 'Medialunas x6',
    description: 'Medialunas de manteca recién horneadas, tiernas y crocantes. Ideal para el desayuno.',
    price: 2200,
    image: 'http://localhost:3001/medialuna.svg',
    category: 'panadería',
    available: true,
  },
];

await mongoose.connect(uri);
console.log('Connected to MongoDB');

await Product.deleteMany({});
const inserted = await Product.insertMany(products);
console.log(`Inserted ${inserted.length} products:`);
inserted.forEach(p => console.log(` - ${p.name} ($${p.price})`));

await mongoose.disconnect();
console.log('Done.');
