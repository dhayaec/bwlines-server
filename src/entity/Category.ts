import slugify from 'slugify';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  Unique,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { Book } from './Book';

@Entity('categories')
@Unique(['slug'])
@Tree('nested-set')
@Index(['parent', 'isBanned'])
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('varchar', { length: 255 })
  slug: string;

  @TreeChildren()
  children: Category[];

  @TreeParent()
  parent: Category;

  @Column({ default: false })
  isBanned: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @OneToMany(() => Book, book => book.category)
  book: Book[];

  @BeforeInsert()
  async slugify() {
    this.slug = slugify(this.name, { lower: true });
  }
}
