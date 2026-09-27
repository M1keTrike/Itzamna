# Itzamna

Itzamna es un avanzado sistema de simulación y optimización de recursos, especialmente diseñado para entornos controlados, hábitats o misiones críticas. 

## ¿Qué es Itzamna y para qué sirve?

Imagina que tienes una misión espacial, una base agrícola cerrada o cualquier sistema donde los recursos (como agua, energía y oxígeno) son muy limitados y vitales. Cuando ocurre una crisis —por ejemplo, una falla en un panel solar o una fuga de agua— los administradores deben tomar decisiones inmediatas: ¿qué apagamos primero?, ¿reducimos el oxígeno en los pasillos para salvar los cultivos?, ¿o sacrificamos los cultivos para asegurar el soporte vital de la tripulación?

**Itzamna** hace este trabajo pesado por ti. Al introducir las reglas de tu sistema (cuánta energía produce cada cosa, cuánto consume, y cuáles son las prioridades), el sistema simula miles de escenarios posibles de manera automática.

En lugar de devolverte una única "respuesta correcta" (porque en situaciones críticas todo tiene pros y contras), te ofrece **Arquetipos de Decisión**; por ejemplo:
*   **Estrategia Conservadora**: Protege al máximo las reservas de emergencia y el soporte vital.
*   **Estrategia de Producción**: Asume más riesgos pero intenta mantener activa la producción de alimentos o manufactura.
*   **Balance Sistémico**: El punto intermedio ideal que equilibra ambos extremos.

El usuario puede explorar estas propuestas visualmente en un mapa interactivo (similar a una presentación) y ver exactamente cómo fluirían los recursos, qué fallaría y qué se salvaría.

---

## Documentación Técnica



El proyecto está dividido en dos partes principales: el Backend (Motor Genético en Python) y el Frontend (Next.js). Ambos deben ejecutarse en paralelo.

### ¿Cómo usarlo? (Instalación y Ejecución)

#### 1. Backend (Motor Genético)
El motor genético está construido con **FastAPI** y **NumPy**. Se encuentra en la carpeta `motor_genetico`.

**Requisitos:** Python 3.10 o superior.

**Pasos:**
1. Abre una terminal y dirígete a la carpeta del motor:
   ```bash
   cd motor_genetico
   ```
2. Instala las dependencias (puedes usar un entorno virtual o `uv`):
   ```bash
   pip install -r requirements.txt
   # O si usas dependencias comunes de FastAPI:
   pip install fastapi uvicorn numpy pydantic pytest
   ```
3. Ejecuta el servidor de desarrollo:
   ```bash
   uvicorn main:app --reload
   ```
El backend estará disponible en `http://localhost:8000`.

#### 2. Frontend (Next.js)
El frontend proporciona la interfaz de usuario interactiva. Está en la raíz del proyecto.

**Requisitos:** Node.js (18+).

**Pasos:**
1. Abre otra terminal en la raíz del proyecto (`Itzamna`).
2. Instala las dependencias de Node:
   ```bash
   npm install
   # o yarn / pnpm / bun install
   ```
3. Ejecuta el servidor de desarrollo del frontend:
   ```bash
   npm run dev
   ```
4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

### Detalles del Frontend 

El frontend de Itzamna permite interactuar con la complejidad del motor genético de una forma visual y fluida.

#### Stack Tecnológico
* **Next.js (App Router) & React:** Para la estructura de la aplicación y la renderización eficiente.
* **Tailwind CSS:** Para el diseño visual (UI) ágil y responsivo.
* **Framer Motion & D3 Hierarchy:** Utilizados en conjunto para crear visualizaciones interactivas de datos (como el árbol de consumidores).
* **Better-SQLite3:** Para la persistencia de datos local en el cliente/servidor Node.

#### Componentes Principales
* **DynamicControls (`DynamicControls.tsx`):** Es el panel de control principal donde los usuarios pueden añadir consumidores, definir sus requerimientos de recursos, establecer prioridades y configurar las métricas de producción. Permite editar el "ADN" del sistema.
* **PreziViewer (`PreziViewer.tsx`):** Un visor jerárquico interactivo, similar a una presentación *Prezi*, que utiliza `d3-hierarchy` y `framer-motion` para mostrar visualmente cómo los recursos fluyen desde la raíz hasta los sub-consumidores. Permite hacer zoom interactivo (drill-down) en cada nodo.
* **GeneticEngine:** Un conjunto de componentes que se conectan con el Backend mediante eventos Server-Sent (SSE) para renderizar la evolución en tiempo real (ej. `ConvergenceChart.tsx`).
* **Reports (`DistributionReportsViewer.tsx`):** Muestra el análisis detallado tras la simulación, enseñando déficits, inventarios finales, y el cumplimiento de las metas.

---

### Detalles del Motor Genético (Backend)

El corazón de Itzamna es un **Algoritmo Genético Multi-Objetivo** que simula el consumo y producción de recursos. A diferencia de un cálculo tradicional, utiliza "evolución artificial" para encontrar soluciones óptimas ante escenarios de crisis.

#### Fases del Algoritmo Genético
1. **Inicialización:** Se genera una población inicial (ej. 100 "individuos"). Cada individuo representa una propuesta única de distribución de recursos porcentual (de 0.0 a 1.0) para cada consumidor.
2. **Decodificación (Top-Down):** Los "genes" (porcentajes) se decodifican en cantidades absolutas. Si la suma de las peticiones excede el recurso disponible, el motor escala y distribuye equitativamente según la prioridad (*weight*) asignada a cada consumidor.
3. **Simulación de Periodos:** Se simula cómo las asignaciones afectan al sistema a lo largo del tiempo. Si un consumidor produce un beneficio útil (ej. alimentos o energía), esto se acumula. Se evalúan **Crisis Dinámicas** (factores que reducen la disponibilidad de recursos) durante los ciclos.
4. **Evaluación (Fitness):** A cada individuo se le asigna un puntaje. El sistema premia:
   * El cumplimiento de las demandas de los consumidores de alta prioridad.
   * La generación de beneficios útiles para la misión/hábitat.
   * La preservación de reservas mínimas.
   El sistema **penaliza** severamente si se violan cuotas de supervivencia (déficit crítico) o si un sub-consumidor intenta usar más recursos de los que recibió su nodo padre.
5. **Selección por Torneo & Elitismo:** Los mejores individuos de la generación pasan intactos a la siguiente (Elitismo). El resto compite en "torneos" para reproducirse.
6. **Cruce y Mutación:** Los "ganadores" combinan sus genes (porcentajes de distribución) usando un *crossover* aritmético, y luego sufren ligeras mutaciones gaussianas (alteraciones aleatorias) para explorar nuevas soluciones y evitar el estancamiento.
7. **Iteración:** El proceso se repite por $N$ generaciones hasta que el sistema converge en estrategias óptimas.

#### Estrategias Avanzadas Utilizadas

* **Frentes de Pareto (NSGA-II simplificado):**
En un sistema real, no hay una única "solución perfecta". Existe un compromiso (Trade-off). El motor utiliza la lógica del **Frente de Pareto** para filtrar y encontrar a los individuos "no dominados" (aquellos que no pueden mejorar en un objetivo sin empeorar en otro).
La interfaz devuelve **Arquetipos** de decisión basados en este frente:
  * **Estrategia Producción:** Sesgada a maximizar la rama productiva.
  * **Estrategia Conservadora:** Sesgada a proteger reservas y ramas críticas.
  * **Balance Sistémico:** El individuo con la distancia euclidiana más corta al "Punto Utópico" (el máximo teórico de todos los objetivos).

* **Jerarquía Estricta de Recursos (Mapping Constraint):**
Los recursos fluyen de un nodo padre a los hijos. La función de fitness aplica un cálculo estricto: un hijo jamás puede recibir un volumen mayor de recurso del que se le fue otorgado al padre. Esto garantiza que la simulación refleje redes físicas y cuellos de botella reales.

* **Simulación de Crisis e Incertidumbre:**
Se pueden configurar variables de crisis (ej. *Falla en Filtros de Agua* con 50% de intensidad). El motor aplica automáticamente estos modificadores restando la cantidad base del recurso antes de iniciar la distribución, obligando al genoma a evolucionar defensas o recortes en las ramas menos críticas para asegurar la supervivencia sistémica.

---

Este README sirve como el pilar fundamental para comprender y expandir Itzamna. Su naturaleza híbrida (visualización avanzada + motor de optimización evolutiva) lo convierte en una herramienta versátil tanto para tomadores de decisiones estratégicas como para analistas técnicos.
