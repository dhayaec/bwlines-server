import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';

@Entity('tree_category')
@Tree('materialized-path')
export class TCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @TreeChildren()
  children: TCategory[];

  @TreeParent()
  parent: TCategory;
}
