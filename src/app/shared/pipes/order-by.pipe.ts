// src/app/shared/pipes/order-by.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {
  transform(array: any[], field: string, reverse: boolean = false): any[] {
    if (!Array.isArray(array)) return array;

    // Crée une copie du tableau pour éviter de modifier l'original
    const sortedArray = [...array];

    sortedArray.sort((a, b) => {
      // Pour les dates
      if (field === 'dateCreation') {
        const dateA = new Date(a[field]).getTime();
        const dateB = new Date(b[field]).getTime();
        return reverse ? dateB - dateA : dateA - dateB;
      }

      // Pour les autres champs
      if (a[field] < b[field]) return reverse ? 1 : -1;
      if (a[field] > b[field]) return reverse ? -1 : 1;
      return 0;
    });

    return sortedArray;
  }
}
