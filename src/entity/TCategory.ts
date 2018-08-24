import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';

@Entity('tree_category')
@Tree('nested-set')
export class TCategory {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  name: string;

  @TreeChildren()
  children: TCategory[];

  @TreeParent()
  parent: TCategory;
}
