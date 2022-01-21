import { EntityRepository, Repository } from 'typeorm';
import { RestaurantCategory } from '../restaurantCategory.entity';

@EntityRepository(RestaurantCategory)
export class CategoryRepository extends Repository<RestaurantCategory> {
  async getCategoryByName(name: string): Promise<RestaurantCategory> {
    const categoryName = name.trim().toLowerCase();
    const categorySlug = categoryName.replace(/ /g, '-');
    let category = await this.findOne({ slug: categorySlug });
    if (!category)
      category = this.create({
        slug: categorySlug,
        name: categoryName,
      });
    return category;
  }
}
