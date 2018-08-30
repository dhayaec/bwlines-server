import * as faker from 'faker';
import { Connection } from 'typeorm';
import { Book } from './entity/Book';
import { Category } from './entity/Category';
import { User } from './entity/User';

export async function seeder(db: Connection) {
  const a = Array(50).fill(0);

  const category = db.getRepository(Category);
  const user = db.getRepository(User);
  const book = db.getRepository(Book);

  const adminUser = await user.find({
    where: {
      isAdmin: true,
    },
  });

  if (!adminUser.length) {
    await user
      .create({
        name: 'Administrator',
        email: process.env.SUPER_ADMIN_EMAIL,
        password: process.env.SUPER_ADMIN_PASS,
        isAdmin: true,
      })
      .save();
  }

  const existingUsers = await user.find({
    where: {
      isAdmin: false,
    },
  });

  if (existingUsers.length === 0) {
    const us = new Set();
    a.forEach(() =>
      us.add({
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        email: faker.internet.email().toLowerCase(),
        password: '123456',
        mobile: faker.random.number(9999999999),
      }),
    );
    us.forEach(async x => {
      const u = user.create({
        name: x.name,
        email: x.email,
        password: x.password,
        mobile: x.mobile,
      });
      await u.save();
    });
  }

  const existingCategory = await category.find();

  if (existingCategory.length === 0) {
    const cs = new Set();
    a.forEach(() => cs.add(faker.commerce.department()));
    cs.forEach(async x => {
      const c = category.create({
        name: x,
      });
      const ct = await c.save();

      const sub = await category
        .create({
          name: ct.name + ' Sub',
          parent: ct,
        })
        .save();

      const grandChildCategory = await category
        .create({
          name: sub.name + ' Sub',
          parent: sub,
        })
        .save();

      const bks = new Set();
      const ar = Array(5).fill(0);
      ar.forEach(() =>
        bks.add({
          title: faker.commerce.productName(),
          isbn: faker.random.number(9999999999999).toString(),
          coverImage: faker.image.cats(),
          description: faker.lorem.paragraphs(),
          rating: faker.random.number(5),
          publishedYear: faker.date.future().getFullYear(),
          price: faker.commerce.price(55),
          offerPrice: faker.commerce.price(99),
        }),
      );
      bks.forEach(async bk => {
        const b = book.create({
          title: bk.title,
          isbn: bk.isbn,
          coverImage: bk.coverImage,
          description: bk.description,
          rating: bk.rating,
          publishedYear: bk.publishedYear,
          price: bk.price,
          offerPrice: bk.offerPrice,
          category: grandChildCategory,
        });
        await b.save();
      });
    });
  }
}
