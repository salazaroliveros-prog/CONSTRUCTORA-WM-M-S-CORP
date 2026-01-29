// Datos base para presupuestos (renglones, factores y APUs)
// Nota: este archivo reemplaza el contenido antiguo de "renglones completos.html".

(function (global) {
  'use strict';

  // Listados de 25-30 renglones principales por tipología constructiva
  const renglonesPresupuestos = {
    // TIPOLOGÍA RESIDENCIAL (Viviendas unifamiliares, multifamiliares)
    RESIDENCIAL: [
      { id: 1, nombre: "Movimiento de Tierras y Desmonte", unidad: "m³", cronologia: 1 },
      { id: 2, nombre: "Excavación para Cimientos", unidad: "m³", cronologia: 2 },
      { id: 3, nombre: "Relleno y Compactación", unidad: "m³", cronologia: 3 },
      { id: 4, nombre: "Cimientos de Concreto Ciclópeo", unidad: "m³", cronologia: 4 },
      { id: 5, nombre: "Vigas de Cimentación Armadas", unidad: "ml", cronologia: 5 },
      { id: 6, nombre: "Muros de Contención", unidad: "m²", cronologia: 6 },
      { id: 7, nombre: "Sobrecimiento de Concreto", unidad: "ml", cronologia: 7 },
      { id: 8, nombre: "Mampostería de Bloque (Nivel 1)", unidad: "m²", cronologia: 8 },
      { id: 9, nombre: "Vigas de Amarre Nivel 1", unidad: "ml", cronologia: 9 },
      { id: 10, nombre: "Losas de Entrepiso o Cubierta", unidad: "m²", cronologia: 10 },
      { id: 11, nombre: "Columnas Estructurales", unidad: "unidad", cronologia: 11 },
      { id: 12, nombre: "Mampostería de Bloque (Nivel 2)", unidad: "m²", cronologia: 12 },
      { id: 13, nombre: "Vigas de Amarre Nivel 2", unidad: "ml", cronologia: 13 },
      { id: 14, nombre: "Estructura de Cubierta (Madera/Metal)", unidad: "m²", cronologia: 14 },
      { id: 15, nombre: "Cubierta de Teja o Lámina", unidad: "m²", cronologia: 15 },
      { id: 16, nombre: "Instalación Eléctrica Preliminar", unidad: "ml", cronologia: 16 },
      { id: 17, nombre: "Instalación Hidrosanitaria Preliminar", unidad: "ml", cronologia: 17 },
      { id: 18, nombre: "Repello de Muros Interiores", unidad: "m²", cronologia: 18 },
      { id: 19, nombre: "Repello de Muros Exteriores", unidad: "m²", cronologia: 19 },
      { id: 20, nombre: "Pisos de Cerámica o Porcelanato", unidad: "m²", cronologia: 20 },
      { id: 21, nombre: "Instalación Eléctrica Final", unidad: "punto", cronologia: 21 },
      { id: 22, nombre: "Instalación Hidrosanitaria Final", unidad: "unidad", cronologia: 22 },
      { id: 23, nombre: "Pintura Interior y Exterior", unidad: "m²", cronologia: 23 },
      { id: 24, nombre: "Carpintería de Madera (Puertas/Ventanas)", unidad: "unidad", cronologia: 24 },
      { id: 25, nombre: "Herrajes y Accesorios", unidad: "unidad", cronologia: 25 },
      { id: 26, nombre: "Instalación de Vidrios", unidad: "m²", cronologia: 26 },
      { id: 27, nombre: "Acabados de Baños y Cocina", unidad: "juego", cronologia: 27 },
      { id: 28, nombre: "Impermeabilización", unidad: "m²", cronologia: 28 },
      { id: 29, nombre: "Urbanización Externa (Andenes, Gradas)", unidad: "m²", cronologia: 29 },
      { id: 30, nombre: "Jardinería y Cercado Perimetral", unidad: "ml", cronologia: 30 }
    ],

    // TIPOLOGÍA COMERCIAL (Edificios de oficinas, centros comerciales)
    COMERCIAL: [
      { id: 1, nombre: "Estudio Geotécnico y Topográfico", unidad: "estudio", cronologia: 1 },
      { id: 2, nombre: "Excavación Profunda con Sostenimiento", unidad: "m³", cronologia: 2 },
      { id: 3, nombre: "Pilotaje o Cimentación Profunda", unidad: "ml", cronologia: 3 },
      { id: 4, nombre: "Losa de Cimentación (Radier)", unidad: "m³", cronologia: 4 },
      { id: 5, nombre: "Muros de Sótano Impermeabilizados", unidad: "m²", cronologia: 5 },
      { id: 6, nombre: "Columnas de Concreto Armado Nivel 0", unidad: "unidad", cronologia: 6 },
      { id: 7, nombre: "Vigas de Cimentación Preesforzadas", unidad: "ml", cronologia: 7 },
      { id: 8, nombre: "Estructura Metálica Principal", unidad: "ton", cronologia: 8 },
      { id: 9, nombre: "Losas de Entrepiso Postensadas", unidad: "m²", cronologia: 9 },
      { id: 10, nombre: "Fachada Ventilada o Muro Cortina", unidad: "m²", cronologia: 10 },
      { id: 11, nombre: "Ascensores y Montacargas", unidad: "unidad", cronologia: 11 },
      { id: 12, nombre: "Sistema Contra Incendios", unidad: "sistema", cronologia: 12 },
      { id: 13, nombre: "Climatización Central (HVAC)", unidad: "sistema", cronologia: 13 },
      { id: 14, nombre: "Instalación Eléctrica Trifásica", unidad: "ml", cronologia: 14 },
      { id: 15, nombre: "Subestación Eléctrica", unidad: "unidad", cronologia: 15 },
      { id: 16, nombre: "Sistema de Bombeo y Tanques", unidad: "sistema", cronologia: 16 },
      { id: 17, nombre: "Red de Gas Natural", unidad: "ml", cronologia: 17 },
      { id: 18, nombre: "Sistema de Telecomunicaciones", unidad: "sistema", cronologia: 18 },
      { id: 19, nombre: "Acabados de Lujo en Áreas Públicas", unidad: "m²", cronologia: 19 },
      { id: 20, nombre: "Pisos Técnicos Elevados", unidad: "m²", cronologia: 20 },
      { id: 21, nombre: "Falso Plafón Registrable", unidad: "m²", cronologia: 21 },
      { id: 22, nombre: "Carpintería de Aluminio y Vidrio", unidad: "m²", cronologia: 22 },
      { id: 23, nombre: "Instalaciones Sanitarias Comerciales", unidad: "unidad", cronologia: 23 },
      { id: 24, nombre: "Sistema de Seguridad y CCTV", unidad: "sistema", cronologia: 24 },
      { id: 25, nombre: "Iluminación de Emergencia", unidad: "unidad", cronologia: 25 },
      { id: 26, nombre: "Señalización y Rotulación", unidad: "unidad", cronologia: 26 },
      { id: 27, nombre: "Mobiliario Fijo Comercial", unidad: "unidad", cronologia: 27 },
      { id: 28, nombre: "Adecuación de Locales Comerciales", unidad: "local", cronologia: 28 },
      { id: 29, nombre: "Estacionamiento con Señalización", unidad: "cajon", cronologia: 29 },
      { id: 30, nombre: "Paisajismo y Áreas Verdes", unidad: "m²", cronologia: 30 }
    ],

    // TIPOLOGÍA INDUSTRIAL (Plantas de producción, bodegas)
    INDUSTRIAL: [
      { id: 1, nombre: "Nivelación y Compactación de Terreno", unidad: "m²", cronologia: 1 },
      { id: 2, nombre: "Excavación para Cimientos Industriales", unidad: "m³", cronologia: 2 },
      { id: 3, nombre: "Cimientos para Maquinaria Pesada", unidad: "unidad", cronologia: 3 },
      { id: 4, nombre: "Losas Industriales de Alta Resistencia", unidad: "m³", cronologia: 4 },
      { id: 5, nombre: "Estructura Metálica Galvanizada", unidad: "ton", cronologia: 5 },
      { id: 6, nombre: "Cubierta Termoacústica", unidad: "m²", cronologia: 6 },
      { id: 7, nombre: "Panaleros y Claraboyas", unidad: "unidad", cronologia: 7 },
      { id: 8, nombre: "Muros de Panel Sandwich", unidad: "m²", cronologia: 8 },
      { id: 9, nombre: "Puertas Industriales Seccionales", unidad: "unidad", cronologia: 9 },
      { id: 10, nombre: "Pisos Epóxicos o de Concreto Pulido", unidad: "m²", cronologia: 10 },
      { id: 11, nombre: "Sistema de Drenaje Industrial", unidad: "ml", cronologia: 11 },
      { id: 12, nombre: "Instalación Eléctrica Industrial", unidad: "ml", cronologia: 12 },
      { id: 13, nombre: "Subestación Eléctrica Industrial", unidad: "unidad", cronologia: 13 },
      { id: 14, nombre: "Sistema de Puesta a Tierra", unidad: "sistema", cronologia: 14 },
      { id: 15, nombre: "Red de Aire Comprimido", unidad: "ml", cronologia: 15 },
      { id: 16, nombre: "Sistema Contra Incendios Industrial", unidad: "sistema", cronologia: 16 },
      { id: 17, nombre: "Ventilación Forzada y Extractores", unidad: "unidad", cronologia: 17 },
      { id: 18, nombre: "Oficinas y Vestidores", unidad: "m²", cronologia: 18 },
      { id: 19, nombre: "Rampas de Carga y Descarga", unidad: "unidad", cronologia: 19 },
      { id: 20, nombre: "Andenes y Plataformas de Trabajo", unidad: "m²", cronologia: 20 },
      { id: 21, nombre: "Cerco Perimetral de Seguridad", unidad: "ml", cronologia: 21 },
      { id: 22, nombre: "Sistema de Iluminación Industrial", unidad: "unidad", cronologia: 22 },
      { id: 23, nombre: "Instalación de Maquinaria", unidad: "unidad", cronologia: 23 },
      { id: 24, nombre: "Sistema de Gestión de Residuos", unidad: "sistema", cronologia: 24 },
      { id: 25, nombre: "Tanques de Almacenamiento", unidad: "unidad", cronologia: 25 },
      { id: 26, nombre: "Sistema de Tratamiento de Aguas", unidad: "sistema", cronologia: 26 },
      { id: 27, nombre: "Vías de Acceso y Circulación", unidad: "m²", cronologia: 27 },
      { id: 28, nombre: "Señalización Industrial", unidad: "unidad", cronologia: 28 },
      { id: 29, nombre: "Control de Acceso y Seguridad", unidad: "sistema", cronologia: 29 },
      { id: 30, nombre: "Mantenimiento Preventivo Inicial", unidad: "lote", cronologia: 30 }
    ],

    // TIPOLOGÍA CIVIL (Puentes, carreteras, túneles)
    CIVIL: [
      { id: 1, nombre: "Estudio de Impacto Ambiental", unidad: "estudio", cronologia: 1 },
      { id: 2, nombre: "Desmonte y Destronque", unidad: "ha", cronologia: 2 },
      { id: 3, nombre: "Trazado y Nivelación del Terreno", unidad: "km", cronologia: 3 },
      { id: 4, nombre: "Excavación en Roca o Material Selecto", unidad: "m³", cronologia: 4 },
      { id: 5, nombre: "Terraplenes y Rellenos Controlados", unidad: "m³", cronologia: 5 },
      { id: 6, nombre: "Obras de Drenaje (Alcantarillas)", unidad: "ml", cronologia: 6 },
      { id: 7, nombre: "Cunetas y Canales de Coronación", unidad: "ml", cronologia: 7 },
      { id: 8, nombre: "Sub-base Granular", unidad: "m³", cronologia: 8 },
      { id: 9, nombre: "Base Hidráulica o Asfáltica", unidad: "m³", cronologia: 9 },
      { id: 10, nombre: "Carpeta Asfáltica en Caliente", unidad: "m²", cronologia: 10 },
      { id: 11, nombre: "Pavimento Rígido de Concreto", unidad: "m²", cronologia: 11 },
      { id: 12, nombre: "Estructuras de Puentes y Viaductos", unidad: "ml", cronologia: 12 },
      { id: 13, nombre: "Pilotes y Estribos", unidad: "unidad", cronologia: 13 },
      { id: 14, nombre: "Superestructura de Puente", unidad: "ml", cronologia: 14 },
      { id: 15, nombre: "Juntas de Dilatación", unidad: "ml", cronologia: 15 },
      { id: 16, nombre: "Barandas y Sistemas de Contención", unidad: "ml", cronologia: 16 },
      { id: 17, nombre: "Túneles y Obras Subterráneas", unidad: "ml", cronologia: 17 },
      { id: 18, nombre: "Muros de Contención en Gaviones", unidad: "m²", cronologia: 18 },
      { id: 19, nombre: "Obras de Arte y Pasos Peatonales", unidad: "unidad", cronologia: 19 },
      { id: 20, nombre: "Señalización Vertical y Horizontal", unidad: "unidad", cronologia: 20 },
      { id: 21, nombre: "Alumbrado Público", unidad: "unidad", cronologia: 21 },
      { id: 22, nombre: "Sistema de Drenaje Pluvial", unidad: "ml", cronologia: 22 },
      { id: 23, nombre: "Taludes y Revegetación", unidad: "m²", cronologia: 23 },
      { id: 24, nombre: "Vías de Acceso y Camino de Servicio", unidad: "km", cronologia: 24 },
      { id: 25, nombre: "Obras de Protección Fluvial", unidad: "ml", cronologia: 25 },
      { id: 26, nombre: "Pasos de Fauna", unidad: "unidad", cronologia: 26 },
      { id: 27, nombre: "Patios de Maquinaria y Acopio", unidad: "m²", cronologia: 27 },
      { id: 28, nombre: "Sistema de Monitoreo y Control", unidad: "sistema", cronologia: 28 },
      { id: 29, nombre: "Mantenimiento Durante Construcción", unidad: "mes", cronologia: 29 },
      { id: 30, nombre: "Entrega y Puesta en Servicio", unidad: "proyecto", cronologia: 30 }
    ],

    // TIPOLOGÍA PÚBLICA (Escuelas, hospitales, edificios gubernamentales)
    PUBLICA: [
      { id: 1, nombre: "Estudios Previos y Licencias", unidad: "lote", cronologia: 1 },
      { id: 2, nombre: "Replanteo y Trazo del Proyecto", unidad: "proyecto", cronologia: 2 },
      { id: 3, nombre: "Excavaciones Generales", unidad: "m³", cronologia: 3 },
      { id: 4, nombre: "Cimentación Especial para Equipos", unidad: "unidad", cronologia: 4 },
      { id: 5, nombre: "Estructura Sismorresistente", unidad: "m³", cronologia: 5 },
      { id: 6, nombre: "Losas de Gran Luz y Claros", unidad: "m²", cronologia: 6 },
      { id: 7, nombre: "Fachadas con Aislamiento Térmico", unidad: "m²", cronologia: 7 },
      { id: 8, nombre: "Sistema de Climatización Central", unidad: "sistema", cronologia: 8 },
      { id: 9, nombre: "Instalación Eléctrica con Grupos Electrógenos", unidad: "sistema", cronologia: 9 },
      { id: 10, nombre: "Sistema de Agua Potable y Residual", unidad: "sistema", cronologia: 10 },
      { id: 11, nombre: "Red de Gas Medicinal (Hospitales)", unidad: "ml", cronologia: 11 },
      { id: 12, nombre: "Ascensores y Plataformas para Discapacitados", unidad: "unidad", cronologia: 12 },
      { id: 13, nombre: "Sistema Contra Incendios Especializado", unidad: "sistema", cronologia: 13 },
      { id: 14, nombre: "Acabados de Alta Durabilidad", unidad: "m²", cronologia: 14 },
      { id: 15, nombre: "Pisos Antideslizantes y Antibacterianos", unidad: "m²", cronologia: 15 },
      { id: 16, nombre: "Instalaciones Deportivas (Escuelas)", unidad: "unidad", cronologia: 16 },
      { id: 17, nombre: "Equipamiento Médico (Hospitales)", unidad: "unidad", cronologia: 17 },
      { id: 18, nombre: "Mobiliario Especializado", unidad: "unidad", cronologia: 18 },
      { id: 19, nombre: "Sistema de Comunicaciones Internas", unidad: "sistema", cronologia: 19 },
      { id: 20, nombre: "Control de Acceso y Seguridad", unidad: "sistema", cronologia: 20 },
      { id: 21, nombre: "Sistema de Videovigilancia", unidad: "sistema", cronologia: 21 },
      { id: 22, nombre: "Áreas Verdes y Paisajismo", unidad: "m²", cronologia: 22 },
      { id: 23, nombre: "Vialidades y Estacionamientos", unidad: "m²", cronologia: 23 },
      { id: 24, nombre: "Señalización y Señalética", unidad: "unidad", cronologia: 24 },
      { id: 25, nombre: "Sistema de Gestión de Residuos", unidad: "sistema", cronologia: 25 },
      { id: 26, nombre: "Accesibilidad Universal (Rampas, Barandas)", unidad: "unidad", cronologia: 26 },
      { id: 27, nombre: "Energías Alternativas (Paneles Solares)", unidad: "sistema", cronologia: 27 },
      { id: 28, nombre: "Sistema de Reutilización de Aguas", unidad: "sistema", cronologia: 28 },
      { id: 29, nombre: "Pruebas y Certificaciones Finales", unidad: "lote", cronologia: 29 },
      { id: 30, nombre: "Capacitación y Entrega Oficial", unidad: "proyecto", cronologia: 30 }
    ]
  };

  // Alias para compatibilidad con el código existente
  const renglonesPredefinidos = renglonesPresupuestos;

  // Factores y parámetros constructivos por tipo de cubierta/entrepiso
  // (Se conservan por compatibilidad con la UI y para estimaciones cuando falten renglones específicos.)
  const factoresCubierta = {
    "losa_solida": {
      rendimiento_mano_obra: 0.25, // m²/hora-persona
      materiales_por_m2: {
        cemento: 8.5, // bolsas
        arena: 0.45, // m³
        grava: 0.45, // m³
        acero: 12.5, // kg
        formaleta: 0.5 // m²
      },
      tiempo_fraguado: 28, // días
      costo_mano_obra_m2: 85.50 // Q/m²
    },
    "losa_prefabricada": {
      rendimiento_mano_obra: 0.35,
      materiales_por_m2: {
        viguetas: 3.2, // unidades
        bloques_aligerantes: 12, // unidades
        concreto_relleno: 0.1, // m³
        acero: 8.5 // kg
      },
      tiempo_instalacion: 14,
      costo_mano_obra_m2: 65.75
    },
    "estructura_metalica": {
      rendimiento_mano_obra: 0.15,
      materiales_por_m2: {
        acero_estructura: 25, // kg
        pernos_anclaje: 8, // unidades
        pintura_anticorrosiva: 0.35, // litros
        conectores: 12 // unidades
      },
      tiempo_instalacion: 10,
      costo_mano_obra_m2: 120.30
    },
    "pergola_madera": {
      rendimiento_mano_obra: 0.2,
      materiales_por_m2: {
        madera_estructura: 0.05, // m³
        tornillos_inoxidables: 45, // unidades
        sellador_madera: 0.15, // litros
        barniz: 0.2 // litros
      },
      tiempo_instalacion: 7,
      costo_mano_obra_m2: 95.25
    },
    "pergola_metal": {
      rendimiento_mano_obra: 0.18,
      materiales_por_m2: {
        tubo_estructural: 18, // kg
        soldadura: 0.25, // kg
        pintura_esmalte: 0.3, // litros
        anclajes_quimicos: 6 // unidades
      },
      tiempo_instalacion: 8,
      costo_mano_obra_m2: 110.50
    },
    "otros": {
      rendimiento_mano_obra: 0.25,
      materiales_por_m2: {},
      tiempo_instalacion: 0,
      costo_mano_obra_m2: 0
    }
  };


  // Base de datos de rendimientos y precios unitarios por renglón y departamento (ejemplo real)
  const rendimientosYPrecios = [
    {
      renglon: "Movimiento de tierras - Excavación manual",
      departamento: "Guatemala",
      materiales: [
        { nombre: "Pala", unidad: "unidad", cantidad: 0.05, precio_unitario: 120 },
        { nombre: "Carretilla", unidad: "unidad", cantidad: 0.02, precio_unitario: 350 }
      ],
      mano_obra: [
        { oficio: "Peón", rendimiento: 3.5, unidad: "m3/día", precio_unitario: 120 }
      ],
      factores_regionales: {
        ajuste_precio: 1.00,
        observaciones: "Sin ajuste para cabecera departamental"
      }
    },
    {
      renglon: "Concreto f'c=210 kg/cm2 vaciado en sitio",
      departamento: "Quetzaltenango",
      materiales: [
        { nombre: "Cemento Portland", unidad: "bolsa 42.5kg", cantidad: 7.5, precio_unitario: 85 },
        { nombre: "Arena", unidad: "m3", cantidad: 0.5, precio_unitario: 180 },
        { nombre: "Grava", unidad: "m3", cantidad: 0.7, precio_unitario: 200 }
      ],
      mano_obra: [
        { oficio: "Oficial albañil", rendimiento: 2.0, unidad: "m3/día", precio_unitario: 180 },
        { oficio: "Ayudante", rendimiento: 2.0, unidad: "m3/día", precio_unitario: 120 }
      ],
      factores_regionales: {
        ajuste_precio: 1.08,
        observaciones: "Ajuste por transporte y altitud"
      }
    },
    {
      renglon: "Mampostería de block 15x20x40 cm",
      departamento: "Guatemala",
      materiales: [
        { nombre: "Block", unidad: "unidad", cantidad: 12.5, precio_unitario: 7.5 },
        { nombre: "Cemento Portland", unidad: "bolsa 42.5kg", cantidad: 1.2, precio_unitario: 85 },
        { nombre: "Arena", unidad: "m3", cantidad: 0.06, precio_unitario: 180 }
      ],
      mano_obra: [
        { oficio: "Oficial albañil", rendimiento: 6.0, unidad: "m2/día", precio_unitario: 180 },
        { oficio: "Ayudante", rendimiento: 6.0, unidad: "m2/día", precio_unitario: 120 }
      ],
      factores_regionales: {
        ajuste_precio: 1.00,
        observaciones: "Sin ajuste para cabecera departamental"
      }
    }
    ,
    {
      renglon: "Excavación para Cimientos",
      departamento: "Guatemala",
      materiales: [
        { nombre: "Pala", unidad: "unidad", cantidad: 0.04, precio_unitario: 120 },
        { nombre: "Carretilla", unidad: "unidad", cantidad: 0.02, precio_unitario: 350 }
      ],
      mano_obra: [
        { oficio: "Peón", rendimiento: 3.0, unidad: "m3/día", precio_unitario: 120 }
      ],
      factores_regionales: {
        ajuste_precio: 1.00,
        observaciones: "Estimado base para excavación manual"
      }
    },
    {
      renglon: "Relleno y Compactación",
      departamento: "Guatemala",
      materiales: [
        { nombre: "Material de relleno", unidad: "m3", cantidad: 1.00, precio_unitario: 75 }
      ],
      mano_obra: [
        { oficio: "Peón", rendimiento: 6.0, unidad: "m3/día", precio_unitario: 120 }
      ],
      factores_regionales: {
        ajuste_precio: 1.00,
        observaciones: "Estimado base (sin equipo de compactación)"
      }
    },
    {
      renglon: "Cimientos de Concreto Ciclópeo",
      departamento: "Guatemala",
      materiales: [
        { nombre: "Cemento Portland", unidad: "bolsa 42.5kg", cantidad: 6.0, precio_unitario: 85 },
        { nombre: "Arena", unidad: "m3", cantidad: 0.40, precio_unitario: 180 },
        { nombre: "Grava", unidad: "m3", cantidad: 0.60, precio_unitario: 200 },
        { nombre: "Piedra bola", unidad: "m3", cantidad: 0.50, precio_unitario: 220 }
      ],
      mano_obra: [
        { oficio: "Oficial albañil", rendimiento: 1.5, unidad: "m3/día", precio_unitario: 180 },
        { oficio: "Ayudante", rendimiento: 1.5, unidad: "m3/día", precio_unitario: 120 }
      ],
      factores_regionales: {
        ajuste_precio: 1.00,
        observaciones: "Estimado base para ciclópeo"
      }
    },
    {
      renglon: "Repello de Muros Interiores",
      departamento: "Guatemala",
      materiales: [
        { nombre: "Cemento Portland", unidad: "bolsa 42.5kg", cantidad: 0.18, precio_unitario: 85 },
        { nombre: "Arena", unidad: "m3", cantidad: 0.02, precio_unitario: 180 },
        { nombre: "Cal hidratada", unidad: "kg", cantidad: 1.50, precio_unitario: 3.50 }
      ],
      mano_obra: [
        { oficio: "Oficial albañil", rendimiento: 12.0, unidad: "m2/día", precio_unitario: 180 },
        { oficio: "Ayudante", rendimiento: 12.0, unidad: "m2/día", precio_unitario: 120 }
      ],
      factores_regionales: {
        ajuste_precio: 1.00,
        observaciones: "Estimado base para repello 1 capa"
      }
    },
    {
      renglon: "Pintura Interior y Exterior",
      departamento: "Guatemala",
      materiales: [
        { nombre: "Pintura vinílica", unidad: "L", cantidad: 0.15, precio_unitario: 35 },
        { nombre: "Sellador", unidad: "L", cantidad: 0.05, precio_unitario: 30 },
        { nombre: "Lija", unidad: "unidad", cantidad: 0.02, precio_unitario: 2.0 }
      ],
      mano_obra: [
        { oficio: "Pintor", rendimiento: 30.0, unidad: "m2/día", precio_unitario: 180 },
        { oficio: "Ayudante", rendimiento: 30.0, unidad: "m2/día", precio_unitario: 120 }
      ],
      factores_regionales: {
        ajuste_precio: 1.00,
        observaciones: "Estimado base (2 manos)"
      }
    },
    {
      renglon: "Pisos de Cerámica o Porcelanato",
      departamento: "Guatemala",
      materiales: [
        { nombre: "Cerámica/Porcelanato", unidad: "m2", cantidad: 1.05, precio_unitario: 90 },
        { nombre: "Pegamento cerámico", unidad: "bolsa", cantidad: 0.20, precio_unitario: 55 },
        { nombre: "Boquilla", unidad: "bolsa", cantidad: 0.05, precio_unitario: 35 }
      ],
      mano_obra: [
        { oficio: "Oficial albañil", rendimiento: 8.0, unidad: "m2/día", precio_unitario: 180 },
        { oficio: "Ayudante", rendimiento: 8.0, unidad: "m2/día", precio_unitario: 120 }
      ],
      factores_regionales: {
        ajuste_precio: 1.00,
        observaciones: "Estimado base"
      }
    },
    {
      renglon: "Impermeabilización",
      departamento: "Guatemala",
      materiales: [
        { nombre: "Manto asfáltico", unidad: "m2", cantidad: 1.10, precio_unitario: 45 },
        { nombre: "Primer asfáltico", unidad: "L", cantidad: 0.20, precio_unitario: 28 }
      ],
      mano_obra: [
        { oficio: "Oficial", rendimiento: 20.0, unidad: "m2/día", precio_unitario: 180 },
        { oficio: "Ayudante", rendimiento: 20.0, unidad: "m2/día", precio_unitario: 120 }
      ],
      factores_regionales: {
        ajuste_precio: 1.00,
        observaciones: "Estimado base"
      }
    },
    {
      renglon: "Instalación Eléctrica Preliminar",
      departamento: "Guatemala",
      materiales: [
        { nombre: "Tubo PVC conduit", unidad: "ml", cantidad: 1.00, precio_unitario: 9 },
        { nombre: "Cable #12", unidad: "ml", cantidad: 3.00, precio_unitario: 6 },
        { nombre: "Caja eléctrica", unidad: "unidad", cantidad: 0.20, precio_unitario: 8 },
        { nombre: "Cinta aislante", unidad: "unidad", cantidad: 0.05, precio_unitario: 5 }
      ],
      mano_obra: [
        { oficio: "Electricista", rendimiento: 50.0, unidad: "ml/día", precio_unitario: 180 },
        { oficio: "Ayudante", rendimiento: 50.0, unidad: "ml/día", precio_unitario: 120 }
      ],
      factores_regionales: {
        ajuste_precio: 1.00,
        observaciones: "Estimado base"
      }
    }
  ];

  // APUs (Análisis de Precios Unitarios) por departamento de Guatemala
  const apusGuatemala = {
    guatemala: {
      factor_transporte: 1.15,
      costo_hora_oficial: 45.75,
      costo_hora_ayudante: 32.50,
      materiales_base: {
        cemento: 65.50, // Q/bolsa
        arena: 185.00, // Q/m³
        grava: 210.00, // Q/m³
        bloque_15cm: 4.25, // Q/unidad
        acero_corrugado: 8.75 // Q/kg
      }
    },
    sacatepequez: {
      factor_transporte: 1.10,
      costo_hora_oficial: 44.90,
      costo_hora_ayudante: 32.10,
      materiales_base: { cemento: 66.00, arena: 180.00, grava: 205.00, bloque_15cm: 4.20, acero_corrugado: 8.80 }
    },
    chimaltenango: {
      factor_transporte: 1.12,
      costo_hora_oficial: 44.20,
      costo_hora_ayudante: 31.40,
      materiales_base: { cemento: 66.50, arena: 182.00, grava: 208.00, bloque_15cm: 4.18, acero_corrugado: 8.85 }
    },
    escuintla: {
      factor_transporte: 1.14,
      costo_hora_oficial: 45.10,
      costo_hora_ayudante: 32.20,
      materiales_base: { cemento: 66.25, arena: 188.00, grava: 212.00, bloque_15cm: 4.28, acero_corrugado: 8.90 }
    },
    santa_rosa: {
      factor_transporte: 1.18,
      costo_hora_oficial: 44.10,
      costo_hora_ayudante: 31.20,
      materiales_base: { cemento: 67.20, arena: 190.00, grava: 218.00, bloque_15cm: 4.35, acero_corrugado: 9.05 }
    },
    solola: {
      factor_transporte: 1.16,
      costo_hora_oficial: 43.20,
      costo_hora_ayudante: 30.60,
      materiales_base: { cemento: 67.00, arena: 178.00, grava: 206.00, bloque_15cm: 4.15, acero_corrugado: 8.95 }
    },
    suchitepequez: {
      factor_transporte: 1.17,
      costo_hora_oficial: 43.90,
      costo_hora_ayudante: 31.00,
      materiales_base: { cemento: 67.10, arena: 186.00, grava: 212.00, bloque_15cm: 4.25, acero_corrugado: 9.00 }
    },
    retalhuleu: {
      factor_transporte: 1.19,
      costo_hora_oficial: 44.30,
      costo_hora_ayudante: 31.30,
      materiales_base: { cemento: 67.60, arena: 190.00, grava: 218.00, bloque_15cm: 4.35, acero_corrugado: 9.10 }
    },
    san_marcos: {
      factor_transporte: 1.20,
      costo_hora_oficial: 42.80,
      costo_hora_ayudante: 30.20,
      materiales_base: { cemento: 68.00, arena: 182.00, grava: 210.00, bloque_15cm: 4.20, acero_corrugado: 9.05 }
    },
    quetzaltenango: {
      factor_transporte: 1.08,
      costo_hora_oficial: 42.30,
      costo_hora_ayudante: 29.80,
      materiales_base: {
        cemento: 67.25,
        arena: 175.00,
        grava: 205.00,
        bloque_15cm: 4.10,
        acero_corrugado: 8.95
      }
    },
    totonicapan: {
      factor_transporte: 1.15,
      costo_hora_oficial: 42.10,
      costo_hora_ayudante: 29.70,
      materiales_base: { cemento: 67.80, arena: 176.00, grava: 206.00, bloque_15cm: 4.12, acero_corrugado: 9.00 }
    },
    huehuetenango: {
      factor_transporte: 1.22,
      costo_hora_oficial: 41.80,
      costo_hora_ayudante: 29.40,
      materiales_base: { cemento: 68.50, arena: 185.00, grava: 214.00, bloque_15cm: 4.30, acero_corrugado: 9.15 }
    },
    quiche: {
      factor_transporte: 1.20,
      costo_hora_oficial: 42.00,
      costo_hora_ayudante: 29.60,
      materiales_base: { cemento: 68.20, arena: 182.00, grava: 212.00, bloque_15cm: 4.25, acero_corrugado: 9.10 }
    },
    baja_verapaz: {
      factor_transporte: 1.18,
      costo_hora_oficial: 43.10,
      costo_hora_ayudante: 30.40,
      materiales_base: { cemento: 67.40, arena: 188.00, grava: 216.00, bloque_15cm: 4.35, acero_corrugado: 9.05 }
    },
    alta_verapaz: {
      factor_transporte: 1.25,
      costo_hora_oficial: 42.80,
      costo_hora_ayudante: 30.10,
      materiales_base: { cemento: 69.20, arena: 195.00, grava: 225.00, bloque_15cm: 4.55, acero_corrugado: 9.45 }
    },
    el_progreso: {
      factor_transporte: 1.16,
      costo_hora_oficial: 44.40,
      costo_hora_ayudante: 31.60,
      materiales_base: { cemento: 66.90, arena: 188.00, grava: 214.00, bloque_15cm: 4.32, acero_corrugado: 9.00 }
    },
    zacapa: {
      factor_transporte: 1.22,
      costo_hora_oficial: 44.90,
      costo_hora_ayudante: 32.10,
      materiales_base: { cemento: 68.20, arena: 198.00, grava: 228.00, bloque_15cm: 4.60, acero_corrugado: 9.55 }
    },
    jalapa: {
      factor_transporte: 1.20,
      costo_hora_oficial: 43.90,
      costo_hora_ayudante: 31.10,
      materiales_base: { cemento: 68.00, arena: 192.00, grava: 220.00, bloque_15cm: 4.45, acero_corrugado: 9.30 }
    },
    jutiapa: {
      factor_transporte: 1.22,
      costo_hora_oficial: 44.10,
      costo_hora_ayudante: 31.30,
      materiales_base: { cemento: 68.40, arena: 196.00, grava: 226.00, bloque_15cm: 4.55, acero_corrugado: 9.45 }
    },
    chiquimula: {
      factor_transporte: 1.24,
      costo_hora_oficial: 44.40,
      costo_hora_ayudante: 31.70,
      materiales_base: { cemento: 68.90, arena: 200.00, grava: 232.00, bloque_15cm: 4.65, acero_corrugado: 9.60 }
    },
    peten: {
      factor_transporte: 1.35,
      costo_hora_oficial: 48.90,
      costo_hora_ayudante: 35.20,
      materiales_base: {
        cemento: 72.50,
        arena: 225.00,
        grava: 255.00,
        bloque_15cm: 5.25,
        acero_corrugado: 10.25
      }
    },
    izabal: {
      factor_transporte: 1.25,
      costo_hora_oficial: 44.80,
      costo_hora_ayudante: 31.75,
      materiales_base: {
        cemento: 66.80,
        arena: 195.00,
        grava: 225.00,
        bloque_15cm: 4.45,
        acero_corrugado: 9.15
      }
    }
  };

  function obtenerRenglonesPorTipologia(tipologia) {
    const clave = (tipologia || '').toUpperCase();
    return renglonesPresupuestos[clave] || [];
  }

  function normalizarUnidadBasica(unidad) {
    const u = (unidad || '').toString().toLowerCase().trim();
    if (u === 'm²' || u === 'm2') return 'm2';
    if (u === 'm³' || u === 'm3') return 'm3';
    if (u === 'ml') return 'ml';
    if (u === 'kg') return 'kg';
    return u;
  }

  function normalizarClaveDepartamento(departamento) {
    return (departamento || '')
      .toString()
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '_');
  }

  function normalizarNombreRenglon(renglonNombre) {
    return (renglonNombre || '')
      .toString()
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ');
  }

  function obtenerApuDepto(departamento) {
    const clave = normalizarClaveDepartamento(departamento || 'guatemala') || 'guatemala';
    return apusGuatemala[clave] || apusGuatemala.guatemala;
  }

  function encontrarRegistroRendimiento(renglonNombre, departamento) {
    const nombre = normalizarNombreRenglon(renglonNombre);
    const depto = normalizarClaveDepartamento(departamento || 'guatemala') || 'guatemala';
    if (!nombre) return null;

    // 1) Exacto por depto
    let match = rendimientosYPrecios.find(r =>
      normalizarNombreRenglon(r.renglon) === nombre &&
      normalizarClaveDepartamento(r.departamento) === depto
    );
    if (match) return match;

    // 2) Exacto por Guatemala como default
    match = rendimientosYPrecios.find(r =>
      normalizarNombreRenglon(r.renglon) === nombre &&
      normalizarClaveDepartamento(r.departamento) === 'guatemala'
    );
    if (match) {
      // Si el depto no tiene registro exacto, aplicamos factor regional del depto solicitado.
      if (depto !== 'guatemala') {
        const apuDepto = obtenerApuDepto(departamento);
        const factor = Number(apuDepto && apuDepto.factor_transporte) || 1;
        return {
          ...match,
          factores_regionales: {
            ...(match.factores_regionales || {}),
            ajuste_precio: factor,
            observaciones: (match.factores_regionales && match.factores_regionales.observaciones)
              ? match.factores_regionales.observaciones
              : 'Estimado: ajuste regional aplicado por transporte'
          }
        };
      }
      return match;
    }

    // 3) Fallback por palabras clave (plantillas)
    const apu = obtenerApuDepto(departamento);
    const factor = Number(apu && apu.factor_transporte) || 1;
    const jornalOficial = (Number(apu && apu.costo_hora_oficial) || 0) * 8;
    const jornalAyudante = (Number(apu && apu.costo_hora_ayudante) || 0) * 8;
    const unidad = null;

    const plantillas = [
      {
        test: (n) => n.includes('excav') || n.includes('movimiento de tierras') || n.includes('desmonte'),
        renglon: 'Movimiento de tierras - Excavación manual',
        unidad,
        materiales: [
          { nombre: 'Pala', unidad: 'unidad', cantidad: 0.05, precio_unitario: 120 },
          { nombre: 'Carretilla', unidad: 'unidad', cantidad: 0.02, precio_unitario: 350 }
        ],
        mano_obra: [
          { oficio: 'Peón', rendimiento: 3.5, unidad: 'm3/día', precio_unitario: jornalAyudante || 120 }
        ]
      },
      {
        test: (n) => n.includes('concreto') || n.includes('losa') || n.includes('ciment'),
        renglon: "Concreto f'c=210 kg/cm2 vaciado en sitio",
        unidad,
        materiales: [
          { nombre: 'Cemento Portland', unidad: 'bolsa 42.5kg', cantidad: 7.5, precio_unitario: (Number(apu.materiales_base && apu.materiales_base.cemento) || 85) },
          { nombre: 'Arena', unidad: 'm3', cantidad: 0.5, precio_unitario: (Number(apu.materiales_base && apu.materiales_base.arena) || 180) },
          { nombre: 'Grava', unidad: 'm3', cantidad: 0.7, precio_unitario: (Number(apu.materiales_base && apu.materiales_base.grava) || 200) }
        ],
        mano_obra: [
          { oficio: 'Oficial albañil', rendimiento: 2.0, unidad: 'm3/día', precio_unitario: jornalOficial || 180 },
          { oficio: 'Ayudante', rendimiento: 2.0, unidad: 'm3/día', precio_unitario: jornalAyudante || 120 }
        ]
      },
      {
        test: (n) => n.includes('mamposter') || n.includes('bloque') || n.includes('muro'),
        renglon: 'Mampostería de block 15x20x40 cm',
        unidad,
        materiales: [
          { nombre: 'Block', unidad: 'unidad', cantidad: 12.5, precio_unitario: (Number(apu.materiales_base && apu.materiales_base.bloque_15cm) || 7.5) },
          { nombre: 'Cemento Portland', unidad: 'bolsa 42.5kg', cantidad: 1.2, precio_unitario: (Number(apu.materiales_base && apu.materiales_base.cemento) || 85) },
          { nombre: 'Arena', unidad: 'm3', cantidad: 0.06, precio_unitario: (Number(apu.materiales_base && apu.materiales_base.arena) || 180) }
        ],
        mano_obra: [
          { oficio: 'Oficial albañil', rendimiento: 6.0, unidad: 'm2/día', precio_unitario: jornalOficial || 180 },
          { oficio: 'Ayudante', rendimiento: 6.0, unidad: 'm2/día', precio_unitario: jornalAyudante || 120 }
        ]
      },
      {
        test: (n) => n.includes('repello') || n.includes('estuco'),
        renglon: 'Repello de Muros Interiores',
        unidad,
        materiales: [
          { nombre: 'Cemento Portland', unidad: 'bolsa 42.5kg', cantidad: 0.18, precio_unitario: (Number(apu.materiales_base && apu.materiales_base.cemento) || 85) },
          { nombre: 'Arena', unidad: 'm3', cantidad: 0.02, precio_unitario: (Number(apu.materiales_base && apu.materiales_base.arena) || 180) },
          { nombre: 'Cal hidratada', unidad: 'kg', cantidad: 1.50, precio_unitario: 3.50 }
        ],
        mano_obra: [
          { oficio: 'Oficial albañil', rendimiento: 12.0, unidad: 'm2/día', precio_unitario: jornalOficial || 180 },
          { oficio: 'Ayudante', rendimiento: 12.0, unidad: 'm2/día', precio_unitario: jornalAyudante || 120 }
        ]
      },
      {
        test: (n) => n.includes('pintura') || n.includes('pintor'),
        renglon: 'Pintura Interior y Exterior',
        unidad,
        materiales: [
          { nombre: 'Pintura vinílica', unidad: 'L', cantidad: 0.15, precio_unitario: 35 },
          { nombre: 'Sellador', unidad: 'L', cantidad: 0.05, precio_unitario: 30 },
          { nombre: 'Lija', unidad: 'unidad', cantidad: 0.02, precio_unitario: 2.0 }
        ],
        mano_obra: [
          { oficio: 'Pintor', rendimiento: 30.0, unidad: 'm2/día', precio_unitario: jornalOficial || 180 },
          { oficio: 'Ayudante', rendimiento: 30.0, unidad: 'm2/día', precio_unitario: jornalAyudante || 120 }
        ]
      },
      {
        test: (n) => n.includes('piso') || n.includes('cerámica') || n.includes('ceramica') || n.includes('porcelanato'),
        renglon: 'Pisos de Cerámica o Porcelanato',
        unidad,
        materiales: [
          { nombre: 'Cerámica/Porcelanato', unidad: 'm2', cantidad: 1.05, precio_unitario: 90 },
          { nombre: 'Pegamento cerámico', unidad: 'bolsa', cantidad: 0.20, precio_unitario: 55 },
          { nombre: 'Boquilla', unidad: 'bolsa', cantidad: 0.05, precio_unitario: 35 }
        ],
        mano_obra: [
          { oficio: 'Oficial albañil', rendimiento: 8.0, unidad: 'm2/día', precio_unitario: jornalOficial || 180 },
          { oficio: 'Ayudante', rendimiento: 8.0, unidad: 'm2/día', precio_unitario: jornalAyudante || 120 }
        ]
      },
      {
        test: (n) => n.includes('impermeabil'),
        renglon: 'Impermeabilización',
        unidad,
        materiales: [
          { nombre: 'Manto asfáltico', unidad: 'm2', cantidad: 1.10, precio_unitario: 45 },
          { nombre: 'Primer asfáltico', unidad: 'L', cantidad: 0.20, precio_unitario: 28 }
        ],
        mano_obra: [
          { oficio: 'Oficial', rendimiento: 20.0, unidad: 'm2/día', precio_unitario: jornalOficial || 180 },
          { oficio: 'Ayudante', rendimiento: 20.0, unidad: 'm2/día', precio_unitario: jornalAyudante || 120 }
        ]
      },
      {
        test: (n) => n.includes('eléctr') || n.includes('electric') || n.includes('tubo pvc') || n.includes('cable'),
        renglon: 'Instalación Eléctrica Preliminar',
        unidad,
        materiales: [
          { nombre: 'Tubo PVC conduit', unidad: 'ml', cantidad: 1.00, precio_unitario: 9 },
          { nombre: 'Cable #12', unidad: 'ml', cantidad: 3.00, precio_unitario: 6 },
          { nombre: 'Caja eléctrica', unidad: 'unidad', cantidad: 0.20, precio_unitario: 8 },
          { nombre: 'Cinta aislante', unidad: 'unidad', cantidad: 0.05, precio_unitario: 5 }
        ],
        mano_obra: [
          { oficio: 'Electricista', rendimiento: 50.0, unidad: 'ml/día', precio_unitario: jornalOficial || 180 },
          { oficio: 'Ayudante', rendimiento: 50.0, unidad: 'ml/día', precio_unitario: jornalAyudante || 120 }
        ]
      }
    ];

    const plantilla = plantillas.find(p => p.test(nombre));
    if (!plantilla) return null;

    return {
      renglon: plantilla.renglon,
      departamento: depto,
      materiales: plantilla.materiales,
      mano_obra: plantilla.mano_obra,
      factores_regionales: {
        ajuste_precio: factor,
        observaciones: 'Estimado por plantilla (sin registro exacto)'
      }
    };
  }

  function calcularCostoUnitarioInterno(renglonNombre, departamento, cantidad, unidadMedida, opciones) {
    const cantidadNum = Number(cantidad) || 0;
    if (cantidadNum <= 0) return { unitario: 0, desglose: { materiales: [], mano_obra: [], equipos: 0 } };

    const unidad = normalizarUnidadBasica(unidadMedida);
    const registro = encontrarRegistroRendimiento(renglonNombre, departamento);
    const apuDepto = obtenerApuDepto(departamento);
    const factorTransporte = Number(apuDepto && apuDepto.factor_transporte) || 1;
    const ajuste = registro && registro.factores_regionales ? (Number(registro.factores_regionales.ajuste_precio) || 1) : factorTransporte;
    const tipoCubierta = opciones && opciones.tipoCubierta ? String(opciones.tipoCubierta) : '';

    // Materiales
    let costoMateriales = 0;
    const desgloseMateriales = [];

    if (registro && Array.isArray(registro.materiales) && registro.materiales.length > 0) {
      registro.materiales.forEach((mat) => {
        const total = (Number(mat.cantidad) || 0) * cantidadNum;
        const precio = Number(mat.precio_unitario) || 0;
        const subtotal = total * precio * ajuste;
        costoMateriales += subtotal;
        desgloseMateriales.push({ ...mat, total, subtotal });
      });
    } else if (tipoCubierta && factoresCubierta[tipoCubierta] && unidad === 'm2') {
      const fc = factoresCubierta[tipoCubierta];
      const mp = fc && fc.materiales_por_m2 ? fc.materiales_por_m2 : {};
      const base = apuDepto && apuDepto.materiales_base ? apuDepto.materiales_base : {};
      Object.entries(mp).forEach(([key, qtyPerM2]) => {
        const total = (Number(qtyPerM2) || 0) * cantidadNum;
        let precio = 0;
        if (key === 'cemento') precio = Number(base.cemento) || 0;
        if (key === 'arena') precio = Number(base.arena) || 0;
        if (key === 'grava') precio = Number(base.grava) || 0;
        if (key === 'acero') precio = Number(base.acero_corrugado) || 0;
        const subtotal = total * precio * factorTransporte;
        costoMateriales += subtotal;
        desgloseMateriales.push({ nombre: key, unidad: 'unidad', cantidad: Number(qtyPerM2) || 0, precio_unitario: precio, total, subtotal });
      });
    }

    // Mano de obra
    let costoManoObra = 0;
    const desgloseManoObra = [];
    if (registro && Array.isArray(registro.mano_obra) && registro.mano_obra.length > 0) {
      registro.mano_obra.forEach((mo) => {
        const rendimiento = Number(mo.rendimiento) || 0;
        const jornales = rendimiento > 0 ? (cantidadNum / rendimiento) : 0;
        const precio = Number(mo.precio_unitario) || 0;
        const subtotal = jornales * precio * ajuste;
        costoManoObra += subtotal;
        desgloseManoObra.push({ ...mo, jornales, subtotal });
      });
    } else if (tipoCubierta && factoresCubierta[tipoCubierta] && unidad === 'm2') {
      // Mano de obra estimada por cubierta cuando no existe registro exacto.
      const fc = factoresCubierta[tipoCubierta];
      const jornalOficial = (Number(apuDepto && apuDepto.costo_hora_oficial) || 0) * 8;
      const m2PorDia = (Number(fc && fc.rendimiento_mano_obra) || 0) * 8;
      const jornales = m2PorDia > 0 ? (cantidadNum / m2PorDia) : 0;
      const precio = Number(fc && fc.costo_mano_obra_m2) > 0
        ? (Number(fc.costo_mano_obra_m2) * 1) * 1
        : (jornalOficial || 0);
      const subtotal = (Number(fc && fc.costo_mano_obra_m2) > 0)
        ? (Number(fc.costo_mano_obra_m2) * cantidadNum * factorTransporte)
        : (jornales * precio * factorTransporte);
      costoManoObra += subtotal;
      desgloseManoObra.push({ oficio: 'Cuadrilla', rendimiento: m2PorDia || 0, unidad: 'm2/día', precio_unitario: precio, jornales, subtotal });
    }

    // Fallback genérico: asegura costo > 0 para cualquier renglón (dependiente del departamento)
    if (costoMateriales === 0 && costoManoObra === 0) {
      const nombre = (renglonNombre || '').toString().toLowerCase();
      const base = apuDepto && apuDepto.materiales_base ? apuDepto.materiales_base : {};
      const jornalOficial = (Number(apuDepto && apuDepto.costo_hora_oficial) || 0) * 8;
      const jornalAyudante = (Number(apuDepto && apuDepto.costo_hora_ayudante) || 0) * 8;

      // Valores “plantilla genérica” por unidad (solo para evitar 0; se puede refinar con más datos)
      let rendimientoDia = 0;
      let matCemento = 0;
      let matArena = 0;
      let matGrava = 0;
      let matAcero = 0;
      let matBlock = 0;

      if (unidad === 'm3') {
        rendimientoDia = 3.0;
        if (nombre.includes('concreto') || nombre.includes('ciment') || nombre.includes('losa')) {
          matCemento = 7.0; matArena = 0.5; matGrava = 0.7; matAcero = 4.0;
        }
      } else if (unidad === 'm2') {
        rendimientoDia = 10.0;
        if (nombre.includes('mamposter') || nombre.includes('bloque')) {
          matBlock = 12.5; matCemento = 1.2; matArena = 0.06;
        } else if (nombre.includes('repello')) {
          matCemento = 0.18; matArena = 0.02;
        } else if (nombre.includes('pintura')) {
          // materiales estimados por m2 (litros) convertidos a subtotal directo
        } else {
          matCemento = 0.12; matArena = 0.015;
        }
      } else if (unidad === 'ml') {
        rendimientoDia = 35.0;
        matAcero = nombre.includes('viga') || nombre.includes('amarre') ? 2.0 : 0;
        matCemento = nombre.includes('sobrecimiento') ? 0.4 : 0;
      } else {
        rendimientoDia = 1.0;
      }

      const precioCemento = Number(base.cemento) || 0;
      const precioArena = Number(base.arena) || 0;
      const precioGrava = Number(base.grava) || 0;
      const precioAcero = Number(base.acero_corrugado) || 0;
      const precioBlock = Number(base.bloque_15cm) || 0;

      const addMat = (nombreMat, unidadMat, cantidadPorUnidad, precioUnit) => {
        const total = (Number(cantidadPorUnidad) || 0) * cantidadNum;
        const precio = Number(precioUnit) || 0;
        const subtotal = total * precio * factorTransporte;
        if (subtotal > 0) {
          costoMateriales += subtotal;
          desgloseMateriales.push({ nombre: nombreMat, unidad: unidadMat, cantidad: Number(cantidadPorUnidad) || 0, precio_unitario: precio, total, subtotal });
        }
      };

      addMat('Cemento', 'bolsa', matCemento, precioCemento || 65);
      addMat('Arena', 'm3', matArena, precioArena || 185);
      addMat('Grava', 'm3', matGrava, precioGrava || 210);
      addMat('Acero corrugado', 'kg', matAcero, precioAcero || 8.75);
      addMat('Block 15cm', 'unidad', matBlock, precioBlock || 4.25);

      const jornales = rendimientoDia > 0 ? (cantidadNum / rendimientoDia) : 0;
      const precioJornal = (unidad === 'm3') ? (jornalAyudante || 0) : (jornalOficial || 0);
      const subtotalMO = jornales * precioJornal * factorTransporte;
      if (subtotalMO > 0) {
        costoManoObra += subtotalMO;
        desgloseManoObra.push({ oficio: 'Cuadrilla', rendimiento: rendimientoDia, unidad: `${unidad || 'unidad'}/día`, precio_unitario: precioJornal, jornales, subtotal: subtotalMO });
      }
    }

    // Equipos (reservado)
    const costoEquipos = 0;

    const costoDirecto = costoMateriales + costoManoObra + costoEquipos;

    return {
      unitario: costoDirecto / cantidadNum,
      desglose: {
        materiales: desgloseMateriales,
        mano_obra: desgloseManoObra,
        equipos: costoEquipos,
        costoDirecto,
        esEstimado: !registro || (registro && registro.factores_regionales && String(registro.factores_regionales.observaciones || '').toLowerCase().includes('estimado'))
      }
    };
  }

  // Compatibilidad: soporta firma antigua por id/tipología/cubierta y firma nueva por nombre.
  function calcularCostoUnitario() {
    const args = Array.from(arguments);

    // Firma antigua: (renglonId, tipologia, tipoCubierta, departamento, cantidad)
    if (typeof args[0] === 'number' && args.length >= 5) {
      const renglonId = args[0];
      const tipologia = args[1];
      const tipoCubierta = args[2];
      const departamento = args[3];
      const cantidad = args[4];
      const claveTipologia = (tipologia || '').toString().toUpperCase();
      const renglon = (renglonesPresupuestos[claveTipologia] || []).find(r => r && r.id === renglonId);
      const nombre = renglon && renglon.nombre ? renglon.nombre : '';
      const unidad = renglon && renglon.unidad ? renglon.unidad : '';
      return calcularCostoUnitarioInterno(nombre, departamento, cantidad, unidad, { tipoCubierta });
    }

    // Firma nueva: (renglonNombre, departamento, cantidad, unidadMedida, opciones?)
    const renglonNombre = args[0];
    const departamento = args[1];
    const cantidad = args[2];
    const unidadMedida = args[3];
    const opciones = args[4];
    return calcularCostoUnitarioInterno(renglonNombre, departamento, cantidad, unidadMedida, opciones);
  }

  // Exponer a la app
  global.renglonesPresupuestos = renglonesPresupuestos;
  global.renglonesPredefinidos = renglonesPredefinidos;
  global.rendimientosYPrecios = rendimientosYPrecios;
  global.factoresCubierta = factoresCubierta;
  global.apusGuatemala = apusGuatemala;
  global.obtenerRenglonesPorTipologia = obtenerRenglonesPorTipologia;
  global.calcularCostoUnitario = calcularCostoUnitario;

  // Compatibilidad opcional para entornos Node (no afecta navegador)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      renglonesPresupuestos,
      renglonesPredefinidos,
      factoresCubierta,
      apusGuatemala,
      obtenerRenglonesPorTipologia,
      calcularCostoUnitario
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
