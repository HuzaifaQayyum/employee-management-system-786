import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchComponent } from './search/search.component';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [ SearchComponent ],
    imports: [
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [ SearchComponent ]
})
export class SharedModule { }
