import * as bcryptjs from 'bcryptjs';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

@Entity('users')
@Unique(['email'])
@Index(['isBanned', 'username', 'confirmed', 'isAdmin'])
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

  @Column('varchar', { length: 255, nullable: true })
  profilePic: string;

  @Column({ default: false })
  isAdmin: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcryptjs.hash(this.password, 10);
  }
}
