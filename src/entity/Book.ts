import slugify from 'slugify';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { Category } from './Category';

@Entity('books')
@Unique(['slug', 'isbn'])
@Index(['isBanned', 'publishedYear'])
export class Book extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  title: string;

  @Column('varchar', { length: 255 })
  slug: string;

  @Column('varchar', { length: 255, nullable: true })
  coverImage: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('varchar', { length: 13 })
  isbn: string;

  @Column('double', { default: 0 })
  rating: number;

  @Column('double', { default: 0 })
  offerPrice: number;

  @Column('double', { default: 0 })
  price: number;

  @Column('double', { default: 0 })
  yourSavings: number;

  @Column('double', { default: 0 })
  publishedYear: number;

  @Column({ default: false })
  isBanned: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @ManyToOne(() => Category, category => category.book)
  category: Category;

  @BeforeInsert()
  async slugify() {
    this.slug = slugify(this.title, { lower: true });
    this.yourSavings = this.offerPrice - this.price;
  }
}
