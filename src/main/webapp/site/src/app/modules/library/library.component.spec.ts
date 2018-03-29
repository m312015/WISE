import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from "@angular/common/http";

import { LibraryComponent } from './library.component';
import { LibraryGroupThumbsComponent } from "./library-group-thumbs/library-group-thumbs.component";
import { LibraryProjectComponent, LibraryProjectDetailsComponent } from "./library-project/library-project.component";
import { LibraryService } from "../../services/library.service";

import {
  MatCardModule,
  MatDialogModule,
  MatIconModule,
  MatExpansionModule } from '@angular/material';

const materialModules = [
  MatCardModule,
  MatDialogModule,
  MatIconModule,
  MatExpansionModule
];

describe('LibraryComponent', () => {
  let component: LibraryComponent;
  let fixture: ComponentFixture<LibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        materialModules
      ],
      declarations: [
        LibraryComponent,
        LibraryGroupThumbsComponent,
        LibraryProjectComponent,
        LibraryProjectDetailsComponent
      ],
      providers: [
        HttpClient,
        HttpHandler,
        LibraryService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
