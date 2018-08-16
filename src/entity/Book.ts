import slugify from 'slugify';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  VersionColumn
} from 'typeorm';
import { Category } from './Category';
import { Publisher } from './Publisher';

@Entity('books')
@Unique(['slug', 'isbn'])
export class Book extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  title: string;

  @Column('varchar', { length: 255 })
  slug: string;

  @Column('varchar', { length: 13 })
  isbn: string;

  @Column('double', { default: 0 })
  rating: number;

  @Column('double', { default: 0 })
  listPrice: number;

  @Column('double', { default: 0 })
  displayPrice: number;

  @Column('double', { default: 0 })
  yourSavings: number;

  @Column('date')
  datePublished: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @ManyToOne(() => Category, category => category.book)
  category: Category;

  @ManyToOne(() => Publisher, publisher => publisher.book)
  publisher: Publisher;

  @BeforeInsert()
  async slugify() {
    this.slug = slugify(this.slug);
  }
}
