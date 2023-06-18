import { Component, ViewChild } from '@angular/core';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { ModalConfig } from 'src/app/datamodels/modal-config.model';

@Component({
  selector: 'app-footer',
  templateUrl: 'footer.component.html',
  styleUrls: ['footer.component.scss']
})
export class FooterComponent {
  @ViewChild('modal') private modalComponent: ModalComponent | undefined;
  
  sourcesModalConfig: ModalConfig = {
    modalTitle: 'Sources',
    closeButtonLabel: 'Close',
    hideDismissButton: () => { return true; },
    onClose: () => {
      return true;
    },
    onDismiss: () => {
      return true;
    }
  };

  public openSourcesModal() {
    this.modalComponent?.open();
  }
}