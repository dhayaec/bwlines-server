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
import { Cart } from './Cart';
import { Category } from './Category';

@Entity('books')
@Unique(['slug', 'isbn'])
@Index(['isBanned'])
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
  listPrice: number;

  @Column('double', { default: 0 })
  displayPrice: number;

  @Column('double', { default: 0 })
  yourSavings: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  datePublished: Date;

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

  @ManyToOne(() => Cart, cart => cart.book)
  cart: Cart;

  @BeforeInsert()
  async slugify() {
    this.slug = slugify(this.title, { lower: true });
    this.yourSavings = this.listPrice - this.displayPrice;
  }
}
