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
  variant: { name: String, description: String },
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

const products = [
  {
    name: 'Empanadas x12',
    description: 'Docena de empanadas caseras. Rellenos a elección: carne, pollo o jamón y queso.',
    price: 4800,
    image: 'https://casa-amarilla-mf.vercel.app/empanada2.png',
    category: 'Empanadas',
    available: true,
    variant: {
      name: 'Carne',
      description: 'Relleno de carne cortada a cuchillo con cebolla, morrón rojo, huevo duro y aceitunas verdes. Condimentada con comino, pimentón dulce y ají molido.',
    },
  },
  {
    name: 'Alfajor de ganache',
    description: 'Alfajor artesanal relleno de ganache de maní. Cobertura de chocolate semiamargo.',
    price: 1200,
    image: 'https://casa-amarilla-mf.vercel.app/alfajor.png',
    category: 'Alfajores',
    available: true,
    variant: {
      name: 'Ganache de Maní',
      description: 'Relleno cremoso de ganache de maní tostado, entre dos tapas de masa sablée. Bañado en chocolate semiamargo artesanal.',
    },
  },
  // {
  //   name: 'Medialunas x6',
  //   description: 'Medialunas de manteca recién horneadas, tiernas y crocantes. Ideal para el desayuno.',
  //   price: 2200,
  //   image: 'http://localhost:3001/medialuna.svg',
  //   category: 'Medialunas',
  //   available: true,
  //   variant: {
  //     name: 'Manteca',
  //     description: 'Masa hojaldrada con manteca de primera calidad. Tiernas por dentro, crocantes por fuera. Bañadas en almíbar liviano.',
  //   },
  // },
];

await mongoose.connect(uri);
console.log('Connected to MongoDB');

await Product.deleteMany({});
const inserted = await Product.insertMany(products);
console.log(`Inserted ${inserted.length} products:`);
inserted.forEach(p => console.log(` - ${p.name} ($${p.price})`));

await mongoose.disconnect();
console.log('Done.');
