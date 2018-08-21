import * as DataLoader from 'dataloader';
import { Category } from '../entity/Category';

type BatchCategory = (ids: string[]) => Promise<Category[]>;

const batchCategories: BatchCategory = async ids => {
  const categories = await Category.findByIds(ids);

  const categoryMap: { [key: string]: Category } = {};
  categories.forEach(u => {
    categoryMap[u.id] = u;
  });

  return ids.map(id => categoryMap[id]);
};

export const categoryLoader = () =>
  new DataLoader<string, Category>(batchCategories);
