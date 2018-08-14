import * as bcryptjs from 'bcryptjs';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  VersionColumn
} from 'typeorm';
import { Photo } from './Photo';

@Entity('users')
@Unique(['email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100 })
  name: string;

  @Column('varchar', { length: 255 })
  email: string;

  @Column('varchar', { length: 30, nullable: true })
  username: string;

  @Column('varchar', { length: 20, nullable: true })
  mobile: string;

  @Column('text')
  password: string;

  @Column({ default: false })
  confirmed: boolean;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ nullable: true })
  lastResetRequestTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @OneToMany(() => Photo, photo => photo.user)
  photos: Photo[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcryptjs.hash(this.password, 10);
  }
}
