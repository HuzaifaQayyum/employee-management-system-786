import { FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
    searchControl: FormControl;
    @Output('query') query = new EventEmitter<string>();

    ngOnInit(): void {
        this.searchControl = new FormControl('');

        this.searchControl.valueChanges.subscribe(searchTxt => this.query.emit(searchTxt));
    }
}
