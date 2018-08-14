import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('photos')
export class Photo {
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
}
