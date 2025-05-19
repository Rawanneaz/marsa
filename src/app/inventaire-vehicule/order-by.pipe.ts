// src/app/inventaire-vehicule/order-by.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {
  transform(array: any[], field: string, reverse: boolean = false): any[] {
    if (!Array.isArray(array)) return array;

    const sortedArray = [...array]; // Crée une copie pour éviter de modifier l'original

    sortedArray.sort((a, b) => {
      // Gestion spéciale pour les dates
      if (field === 'dateCreation') {
        const dateA = new Date(a[field]).getTime();
        const dateB = new Date(b[field]).getTime();
        return reverse ? dateB - dateA : dateA - dateB;
      }

      // Tri standard pour les autres champs
      if (a[field] < b[field]) return reverse ? 1 : -1;
      if (a[field] > b[field]) return reverse ? -1 : 1;
      return 0;
    });

    return sortedArray;
  }
}
