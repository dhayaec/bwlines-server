import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { User } from './User';

@Entity('photos')
export class Photo extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('text')
  description: string;

  @Column('varchar', { length: 255 })
  filename: string;

  @Column('double')
  views: number;

  @Column()
  isPublished: boolean;

  @ManyToOne(() => User, user => user.photos)
  user: User;
}
