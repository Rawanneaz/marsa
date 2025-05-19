import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavireListComponent } from './navire-list.component';

describe('NavireListComponent', () => {
  let component: NavireListComponent;
  let fixture: ComponentFixture<NavireListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavireListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavireListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
