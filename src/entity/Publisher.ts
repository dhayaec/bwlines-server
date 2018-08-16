import slugify from 'slugify';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique
} from 'typeorm';
import { Book } from './Book';

@Entity('publishers')
@Unique(['slug'])
export class Publisher extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('varchar', { length: 255 })
  slug: string;

  @OneToMany(() => Book, book => book.publisher)
  book: Book[];

  @BeforeInsert()
  async slugify() {
    this.slug = slugify(this.name, { lower: true });
  }
}
