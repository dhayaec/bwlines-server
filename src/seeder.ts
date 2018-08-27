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
  //   const manager = getManager();
  const treeCategory = db.getRepository(Category);

  const parent = new Category();
  parent.name = 'Agriculture';
  const p = await treeCategory.save(parent);

  const parent1 = new Category();
  parent1.name = 'Arts';
  await treeCategory.save(parent1);

  const child = new Category();
  child.name = 'Agriculture Products';
  child.parent = p;

  await treeCategory.save(child);

  const child2 = new Category();
  child2.name = 'Agriculture Machines';
  child2.parent = p;

  const child3 = new Category();
  child3.name = 'Arts & Crafts';
  child3.parent = parent1;
  await treeCategory.save(child3);

  await treeCategory.save(child2);

  //   const trees = await manager.getTreeRepository(Category).findRoots();

  //   const grandChild = new Category();
  //   grandChild.name = 'Grand Child';
  //   grandChild.parent = child3;
  //   await treeCategory.save(grandChild);

  //   console.log(trees);

  //   const d = await manager.query(
  //     `DELETE FROM TreePaths WHERE descendant IN (SELECT descendant FROM TreePaths WHERE ancestor = ${2})`,
  //   );

  //   const deleteId = trees[1].id;

  //   const children = await manager
  //     .getTreeRepository(Category)
  //     .findDescendants(parent);

  //   console.log('children');

  //   console.log(children);

  //   const treeList = await manager.getTreeRepository(Category).findTrees();
  //   console.log(JSON.stringify(treeList));

  //   const descendants = await manager
  //     .getTreeRepository(Category)
  //     .findDescendantsTree(parent1);
  //   console.log('descs');
  //   console.log(JSON.stringify(descendants));

  //   const ancestorTree = await manager
  //     .getTreeRepository(Category)
  //     .findAncestorsTree(grandChild);
  //   console.log(JSON.stringify(ancestorTree));

  //   const ancestorCount = await manager
  //     .getTreeRepository(Category)
  //     .countDescendants(parent1);
  //   console.log(ancestorCount);

  //   const d = await manager.getTreeRepository(Category);

  const existingUsers = await user.find({});

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
      const bks = new Set();
      const ar = Array(5).fill(0);
      ar.forEach(() =>
        bks.add({
          title: faker.commerce.productName(),
          isbn: faker.random.number(9999999999999).toString(),
          coverImage: faker.image.cats(),
          description: faker.lorem.paragraphs(),
          rating: faker.random.number(5),
          datePublished: faker.date.past(),
          displayPrice: faker.commerce.price(55),
          listPrice: faker.commerce.price(99),
        }),
      );
      bks.forEach(async bk => {
        const b = book.create({
          title: bk.title,
          isbn: bk.isbn,
          coverImage: bk.coverImage,
          description: bk.description,
          rating: bk.rating,
          datePublished: bk.datePublished,
          displayPrice: bk.displayPrice,
          listPrice: bk.listPrice,
          category: ct,
        });
        await b.save();
      });
    });
  }
}
