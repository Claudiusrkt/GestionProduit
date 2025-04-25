import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProduitService } from './produit.service';
import { Produit } from './model/produit';
import { finalize } from 'rxjs/operators';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'App de gestion';
  produits: Produit[] = [];
  selectedProduit?: Produit;
  error: string | null = null;
  modalType: 'add' | 'edit' | 'delete' | null = null;
  isDeleting = false;
  isSaving = false;
  prestationTotal: number = 0;
  toastVisible = false;
  toastMessage = '';
  toastHeader = '';
  toastType: 'success'|'error' = 'success';

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef<HTMLCanvasElement>;
  private chartInstance?: Chart;
  private barChartInstance?: Chart;

  formData: Produit = {
    idProduit: 0,
    nomProduit: '',
    PrixUnitaire: 0,
    Quantite: 0
  };

  constructor(private ProduitService: ProduitService) { }

  ngOnInit(): void {
    this.loadEnseignants();
  }

  ngOnDestroy(): void {
    [this.chartInstance, this.barChartInstance].forEach(chart => {
      if (chart) chart.destroy();
    });
  }

  private showToast(type: 'success'|'error', header: string, message: string): void {
    this.toastType = type;
    this.toastHeader = header;
    this.toastMessage = message;
    this.toastVisible = true;
    
    setTimeout(() => this.hideToast(), 3000);
  }
  
  hideToast(): void {
    this.toastVisible = false;
  }

  private createCharts(): void {
    if (this.produits.length === 0) return;
    
    const prestations = this.produits.map(e => e.Quantite * e.PrixUnitaire);
    const total = prestations.reduce((acc, val) => acc + val, 0);
    const min = Math.min(...prestations);
    const max = Math.max(...prestations);

    this.createPieChart(prestations);
    this.createBarChart(total, min, max);
  }

  private createPieChart(prestations: number[]): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx || prestations.length === 0) return;

    this.chartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ["Minimum", "Maximum", "Total"],
        datasets: [{
          data: [
            Math.min(...prestations),
            Math.max(...prestations),
            prestations.reduce((acc, val) => acc + val, 0)
          ],
          backgroundColor: ["#FF6384", "#4CAF50", "#36A2EB"],
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
          // title: { display: true, text: 'Répartition des prestations' }
        }
      }
    });
  }

  private createBarChart(total: number, min: number, max: number): void {
    if (this.barChartInstance) {
      this.barChartInstance.destroy();
    }

    const ctx = this.barChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.barChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Total', 'Minimum', 'Maximum'],
        datasets: [{
          label: 'Prestation',
          data: [total, min, max],
          backgroundColor: [
            '#36A2EB', // Couleur pour le total
            '#FF6384', // Couleur pour le minimum
            '#4CAF50'  // Couleur pour le maximum
          ],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'x',
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
            }
          },
          x: {
            title: {
              display: true,
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Répartition des prestations en histogramme'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return `${context.dataset.label}: ${value}`;
              }
            }
          }
        }
      }
    });
  }

  loadEnseignants(): void {
    this.ProduitService.getProduits().pipe(
      finalize(() => {
        if (this.isDeleting) {
          this.closeModal();
        }
      })
    ).subscribe({
      next: (data) => {
        this.produits = data;
        this.prestationTotal = this.produits.reduce(
          (total: number, produit) => total + (produit.Quantite * produit.PrixUnitaire), 0);
        this.createCharts();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  closeModal(): void {
    this.modalType = null;
    this.selectedProduit = undefined;
    this.resetForm();
  }

  openModal(type: 'add' | 'edit' | 'delete', produit?: Produit): void {
    this.modalType = type;
    this.selectedProduit = produit ? { ...produit } : undefined;
    if (produit) {
      this.formData = { ...produit };
    }
  }

  isFormValid(): boolean {
    return !!this.formData.nomProduit &&
      this.formData.Quantite > 0 &&
      this.formData.PrixUnitaire > 0;
  }

  save(): void {
    if (!this.isFormValid()) return;

    this.isSaving = true;
    this.ProduitService.addProduit(this.formData).subscribe({
      next: (newProduit) => {
        this.produits = [...this.produits, newProduit];
        this.loadEnseignants();
        this.closeModal();
        this.showToast('success', 'Succès', 'Produit ajouté avec succès');
      },
      error: (err) => {
        console.error(err);
        this.isSaving = false;
        this.showToast('error', 'Erreur', "Échec de l'ajout du Produit");
      },
      complete: () => this.isSaving = false
    });
  }

  update(): void {
    if (!this.isFormValid()) return;

    this.isSaving = true;
    this.ProduitService.updateProduit(this.formData).subscribe({
      next: (updateProduit) => {
        this.produits = this.produits.map(e =>
          e.idProduit === updateProduit.idProduit ? updateProduit : e
        );
        this.loadEnseignants();
        this.closeModal();
        this.showToast('success', 'Succès', 'Produit modifié avec succès');
      },
      error: (err) => {
        console.error('Échec de la mise à jour:', err);
        this.isSaving = false;
        this.showToast('error', 'Erreur', 'Échec de la modification');
      },
      complete: () => this.isSaving = false
    });
  }

  delete(): void {
    if (!this.selectedProduit?.idProduit) return;

    this.isDeleting = true;
    this.ProduitService.deleteProduit(this.selectedProduit?.idProduit).pipe(
      finalize(() => {
        this.isDeleting = false;
      })
    ).subscribe({
      next: () => {
        this.produits = this.produits.filter(e => e.idProduit !== this.selectedProduit?.idProduit);
        this.closeModal();
        this.loadEnseignants();
        this.showToast('success', 'Succès', 'Produit supprimé avec succès');
      },
      error: (err) => {
        console.error('Échec de la suppression:', err);
        this.loadEnseignants();
        this.showToast('error', 'Erreur', 'Échec de la suppression');
      }
    });
  }

  private resetForm(): void {
    this.formData = {
      idProduit: 0,
      nomProduit: '',
      Quantite: 0,
      PrixUnitaire: 0
    };
  }
}