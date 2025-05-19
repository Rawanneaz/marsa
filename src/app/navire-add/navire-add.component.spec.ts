import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavireAddComponent } from './navire-add.component';

describe('NavireAddComponent', () => {
  let component: NavireAddComponent;
  let fixture: ComponentFixture<NavireAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavireAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavireAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
