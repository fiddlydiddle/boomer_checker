
import { Component, Injectable, Input, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap'
import { ModalConfig } from 'src/app/datamodels/modal-config.model';

@Component({
    selector: 'modal',
    templateUrl: './modal.component.html',
    styleUrls: []
})
@Injectable()
export class ModalComponent implements OnInit {
    @Input() public modalConfig: ModalConfig | undefined;
    @ViewChild('modal') private modalContent: TemplateRef<ModalComponent> | undefined;
    private modalRef: NgbModalRef | undefined;

    constructor(private modalService: NgbModal) { }

    ngOnInit(): void { }

    open(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.modalRef = this.modalService.open(this.modalContent)
            this.modalRef.result.then(resolve, resolve)
        });
    }

    async close(): Promise<void> {
        if (this.modalConfig?.shouldClose === undefined || (await this.modalConfig.shouldClose())) {
            const result = this.modalConfig?.onClose === undefined || (await this.modalConfig.onClose());
            this.modalRef?.close(result);
        }
    }

    async dismiss(): Promise<void> {
        if (this.modalConfig?.shouldDismiss === undefined || (await this.modalConfig.shouldDismiss())) {
            const result = this.modalConfig?.onDismiss === undefined || (await this.modalConfig.onDismiss())
            this.modalRef?.dismiss(result)
        }
    }
}
