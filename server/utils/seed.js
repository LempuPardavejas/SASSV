import User from '../models/User.js';
import Company from '../models/Company.js';
import Product from '../models/Product.js';
import Project from '../models/Project.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Create companies
    const specvatas = Company.create({
      code: 'SPECVATAS',
      name: 'UAB "Spec Vatas"',
      email: 'info@specvatas.lt',
      phone: '+370 600 12345',
      address: 'Vilnius, Lietuva',
      creditLimit: 10000
    });

    const elektra = Company.create({
      code: 'ELEKTRA',
      name: 'UAB "Elektra LT"',
      email: 'info@elektra.lt',
      phone: '+370 600 54321',
      address: 'Kaunas, Lietuva',
      creditLimit: 15000
    });

    const statybos = Company.create({
      code: 'STATYBOS',
      name: 'UAB "Statybų Kompanija"',
      email: 'info@statybos.lt',
      phone: '+370 600 99999',
      address: 'Klaipėda, Lietuva',
      creditLimit: 20000
    });

    console.log('✅ Companies created');

    // Create admin user
    await User.create({
      username: 'admin',
      password: 'admin123',
      role: 'ADMIN',
      pin: '0000'
    });

    // Create client users
    await User.create({
      username: 'specvatas_user',
      password: 'spec123',
      role: 'CLIENT',
      companyId: specvatas.id,
      pin: '1234'
    });

    await User.create({
      username: 'elektra_user',
      password: 'elektra123',
      role: 'CLIENT',
      companyId: elektra.id,
      pin: '2345'
    });

    await User.create({
      username: 'statybos_user',
      password: 'statybos123',
      role: 'CLIENT',
      companyId: statybos.id,
      pin: '3456'
    });

    console.log('✅ Users created');

    // Create products
    Product.create({
      code: '0010006',
      barcode: '1524544204585',
      name: 'Kabelis YDYP 3x1.5',
      category: 'Kabeliai',
      unit: 'm',
      stock: 500,
      price: 2.50,
      minStock: 100
    });

    Product.create({
      code: '0010007',
      barcode: '1524544204586',
      name: 'Kabelis YDYP 3x2.5',
      category: 'Kabeliai',
      unit: 'm',
      stock: 350,
      price: 3.80,
      minStock: 100
    });

    Product.create({
      code: '0010008',
      barcode: '1524544204587',
      name: 'Kabelis YDYP 5x1.5',
      category: 'Kabeliai',
      unit: 'm',
      stock: 250,
      price: 4.20,
      minStock: 50
    });

    Product.create({
      code: '0020001',
      name: 'Jungiklis Schneider Electric',
      category: 'Jungikliai',
      unit: 'vnt',
      stock: 120,
      price: 8.50,
      minStock: 20
    });

    Product.create({
      code: '0020002',
      name: 'Jungiklis Legrand Valena',
      category: 'Jungikliai',
      unit: 'vnt',
      stock: 85,
      price: 12.00,
      minStock: 15
    });

    Product.create({
      code: '0030015',
      name: 'LED lempa 10W',
      category: 'Apšvietimas',
      unit: 'vnt',
      stock: 200,
      price: 5.50,
      minStock: 30
    });

    Product.create({
      code: '0030016',
      name: 'LED lempa 15W',
      category: 'Apšvietimas',
      unit: 'vnt',
      stock: 150,
      price: 7.80,
      minStock: 25
    });

    Product.create({
      code: '0040022',
      name: 'Kabelių kanalas 25x16',
      category: 'Instaliacijos medžiagos',
      unit: 'm',
      stock: 300,
      price: 1.20,
      minStock: 50
    });

    Product.create({
      code: '0040023',
      name: 'Kabelių kanalas 40x25',
      category: 'Instaliacijos medžiagos',
      unit: 'm',
      stock: 180,
      price: 2.50,
      minStock: 40
    });

    Product.create({
      code: '0050001',
      name: 'Automatinis jungiklis 16A',
      category: 'Automatika',
      unit: 'vnt',
      stock: 95,
      price: 15.00,
      minStock: 15
    });

    Product.create({
      code: '0050002',
      name: 'Automatinis jungiklis 25A',
      category: 'Automatika',
      unit: 'vnt',
      stock: 75,
      price: 18.50,
      minStock: 10
    });

    Product.create({
      code: '0060001',
      name: 'Lizdas su įžeminimu',
      category: 'Lizdai',
      unit: 'vnt',
      stock: 140,
      price: 3.50,
      minStock: 25
    });

    console.log('✅ Products created');

    // Create projects
    Project.create({
      companyId: specvatas.id,
      name: '2025 Sausio užsakymas',
      status: 'AKTYVUS'
    });

    Project.create({
      companyId: elektra.id,
      name: '2025 Q1 Projektas',
      status: 'AKTYVUS'
    });

    Project.create({
      companyId: statybos.id,
      name: 'Vilniaus objektas',
      status: 'AKTYVUS'
    });

    console.log('✅ Projects created');

    console.log('🎉 Database seeded successfully!');
    console.log('\n📝 Demo credentials:');
    console.log('Admin: admin / admin123 (PIN: 0000)');
    console.log('Specvatas: specvatas_user / spec123 (PIN: 1234)');
    console.log('Elektra: elektra_user / elektra123 (PIN: 2345)');
    console.log('Statybos: statybos_user / statybos123 (PIN: 3456)');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

export default seedDatabase;
