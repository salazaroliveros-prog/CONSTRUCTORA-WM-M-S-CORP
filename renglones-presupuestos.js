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

  function calcularCostoUnitario(renglonId, tipologia, tipoCubierta, departamento, cantidad) {
    const claveTipologia = (tipologia || '').toUpperCase();
    const claveDepto = (departamento || '').toLowerCase();
    const renglon = (renglonesPresupuestos[claveTipologia] || []).find(r => r.id === renglonId);
    const factores = factoresCubierta[tipoCubierta];
    const apu = apusGuatemala[claveDepto];

    if (!renglon || !factores || !apu) return 0;

    // Cálculos base (simplificado)
    let costoMateriales = 0;
    let costoManoObra = 0;
    let costoEquipos = 0;
    let costosIndirectos = 0;

    // Simulación con factores del departamento y mano de obra según cubierta
    costoMateriales = cantidad * 150 * apu.factor_transporte;
    costoManoObra = cantidad * (factores.costo_mano_obra_m2 || 0);
    costoEquipos = cantidad * 25;
    costosIndirectos = (costoMateriales + costoManoObra + costoEquipos) * 0.18;

    return {
      unitario: costoMateriales + costoManoObra + costoEquipos + costosIndirectos,
      desglose: {
        materiales: costoMateriales,
        mano_obra: costoManoObra,
        equipos: costoEquipos,
        indirectos: costosIndirectos,
        utilidad: (costoMateriales + costoManoObra + costoEquipos + costosIndirectos) * 0.15,
        impuestos: (costoMateriales + costoManoObra + costoEquipos + costosIndirectos) * 0.12
      }
    };
  }

  // Exponer a la app
  global.renglonesPresupuestos = renglonesPresupuestos;
  global.renglonesPredefinidos = renglonesPredefinidos;
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
