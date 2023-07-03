import { Component } from '@angular/core';
import purchaseTypesJSON from '../../datafiles/purchase-types.json';
import { PurchaseType } from 'src/app/datamodels/purchase-type.model';

@Component({
  selector: 'sources-list',
  templateUrl: 'sources-list.component.html'
})
export class SourcesListComponent {
  purchaseTypes: PurchaseType[] = purchaseTypesJSON as unknown as PurchaseType[];
}