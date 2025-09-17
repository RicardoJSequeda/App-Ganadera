import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompany } from '../context/CompanyContext';
import { 
  HelpCircle, 
  Book, 
  MessageCircle, 
  Phone, 
  ChevronDown, 
  ChevronRight,
  Search,
  Mail,
  MapPin,
  Clock,
  PlayCircle,
  FileText,
  Users,
  ShoppingCart,
  TrendingUp,
  Heart,
  Settings,
  Download,
  ExternalLink,
  Lightbulb
} from 'lucide-react';

const Ayuda = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const { companyConfig } = useCompany();

  const faqData = [
    {
      id: 1,
      categoria: 'Animales',
      pregunta: '¿Cómo registro un nuevo animal en el sistema?',
      respuesta: 'Para registrar un nuevo animal, ve a la sección "Animales" y haz clic en "Nuevo Animal". Completa los datos requeridos: número de caravana, color, categoría, peso de ingreso y estado físico. Si el animal viene de una compra, se registrará automáticamente durante el proceso de compra.',
      icon: FileText
    },
    {
      id: 2,
      categoria: 'Animales',
      pregunta: '¿Qué significa cada estado físico del animal?',
      respuesta: 'Los estados físicos son: CRÍTICO (animal enfermo que requiere atención inmediata), MALO (animal con problemas de salud menores), BUENO (animal sano sin problemas), EXCELENTE (animal en condiciones óptimas para venta).',
      icon: Heart
    },
    {
      id: 3,
      categoria: 'Compras',
      pregunta: '¿Cómo funciona el peso promedio en las compras?',
      respuesta: 'Cuando marcas "Usar peso promedio", puedes ingresar un peso que se aplicará a todos los animales de esa compra. Esto es útil cuando compras un lote grande y no puedes pesar cada animal individualmente.',
      icon: ShoppingCart
    },
    {
      id: 4,
      categoria: 'Ventas',
      pregunta: '¿Cómo se calculan los precios en las ventas?',
      respuesta: 'El precio final se calcula multiplicando el peso de salida del animal por el precio por kilogramo establecido en la venta. El sistema muestra automáticamente el total por animal y el total general de la venta.',
      icon: TrendingUp
    },
    {
      id: 5,
      categoria: 'Sanidad',
      pregunta: '¿Cómo registro eventos sanitarios para múltiples animales?',
      respuesta: 'En la sección "Sanidad", puedes seleccionar múltiples animales y aplicar el mismo evento sanitario (vacuna, desparasitario, etc.) a todos. Esto ahorra tiempo cuando aplicás el mismo tratamiento a un grupo.',
      icon: Heart
    },
    {
      id: 6,
      categoria: 'Lotes',
      pregunta: '¿Para qué sirven los lotes?',
      respuesta: 'Los lotes te permiten agrupar animales para facilitar el manejo. Puedes crear lotes por origen, edad, categoría o cualquier criterio que uses en tu campo. Un animal puede estar en un solo lote activo a la vez.',
      icon: Users
    },
    {
      id: 7,
      categoria: 'Sistema',
      pregunta: '¿Puedo exportar mis datos?',
      respuesta: 'Sí, en todas las secciones principales tienes botones para exportar a Excel. Esto incluye listas de animales, compras, ventas, eventos sanitarios y más. Los archivos se descargan con la fecha actual.',
      icon: Download
    },
    {
      id: 8,
      categoria: 'Sistema',
      pregunta: '¿Qué diferencia hay entre administrador y operador?',
      respuesta: 'Los ADMINISTRADORES pueden gestionar usuarios, acceder a configuraciones avanzadas y eliminar registros. Los OPERADORES pueden usar todas las funciones principales pero no pueden gestionar otros usuarios ni acceder a configuraciones críticas.',
      icon: Settings
    },
    {
      id: 9,
      categoria: 'Proveedores',
      pregunta: '¿Cómo gestiono la información de mis proveedores?',
      respuesta: 'En la sección "Proveedores" puedes registrar toda la información: nombre, contacto, CUIT, establecimiento, RENSPA y subir documentos como el boleto de marca. Esta información se vincula automáticamente con las compras.',
      icon: Users
    },
    {
      id: 11,
      categoria: 'Sistema',
      pregunta: '¿Cómo funcionan las confirmaciones del sistema?',
      respuesta: 'El sistema usa confirmaciones personalizadas en lugar de los popups del navegador. Cada acción destructiva (eliminar, borrar datos) muestra un modal custom con colores específicos: ROJO para acciones peligrosas, AMARILLO para advertencias, AZUL para información. Puedes cerrar con ESC, click fuera del modal, o usando los botones.',
      icon: Settings
    },
  ];

  const tutorialSteps = [
    {
      id: 1,
      titulo: 'Primeros Pasos',
      descripcion: 'Configuración inicial y navegación básica',
      duracion: '5 min',
      temas: ['Registro de usuario', 'Navegación por el sistema', 'Configuración básica']
    },
    {
      id: 2,
      titulo: 'Gestión de Animales',
      descripcion: 'Registro y seguimiento de animales',
      duracion: '10 min',
      temas: ['Agregar animales', 'Caravanas y colores', 'Estados físicos', 'Búsqueda y filtros']
    },
    {
      id: 3,
      titulo: 'Compras y Proveedores',
      descripcion: 'Registro de compras y gestión de proveedores',
      duracion: '8 min',
      temas: ['Crear proveedores', 'Registrar compras', 'Peso promedio vs individual', 'Documentos']
    },
    {
      id: 4,
      titulo: 'Ventas y Compradores',
      descripcion: 'Proceso de venta y seguimiento',
      duracion: '7 min',
      temas: ['Seleccionar animales', 'Tipos de venta', 'Calcular precios', 'Generar reportes']
    },
    {
      id: 5,
      titulo: 'Control Sanitario',
      descripcion: 'Registro de eventos sanitarios',
      duracion: '6 min',
      temas: ['Vacunas y tratamientos', 'Eventos múltiples', 'Historial sanitario', 'Alertas']
    },
    {
      id: 6,
      titulo: 'Lotes y Organización',
      descripcion: 'Creación y manejo de lotes',
      duracion: '5 min',
      temas: ['Crear lotes', 'Asignar animales', 'Movimientos', 'Reportes por lote']
    }
  ];

  const contactInfo = {
    telefono: companyConfig.telefono || '+57 604 123-4567',
    email: companyConfig.email || 'soporte@gutierrezhnos.com',
    direccion: companyConfig.direccion || 'Montería, Córdoba, Colombia',
    horarios: 'Lunes a Viernes 8:00 - 18:00'
  };

  const filteredFaq = faqData.filter(faq =>
    faq.pregunta.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.respuesta.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const tabs = [
    { id: 'faq', label: 'Preguntas Frecuentes', icon: HelpCircle },
    { id: 'tutorial', label: 'Tutorial', icon: PlayCircle },
    { id: 'contacto', label: 'Contacto', icon: Phone }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-rural-primary/10 rounded-xl">
            <HelpCircle className="h-6 w-6 text-rural-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-rural-text">Centro de Ayuda</h1>
            <p className="text-rural-text/60">Guías, tutoriales y soporte para {companyConfig.nombre} App</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-rural-card rounded-2xl shadow-sm border border-rural-alternate/50">
        <div className="border-b border-rural-alternate/20">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-rural-primary text-rural-primary'
                      : 'border-transparent text-rural-text/60 hover:text-rural-text'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab FAQ */}
          {activeTab === 'faq' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-rural-text/40" />
                <input
                  type="text"
                  placeholder="Buscar en preguntas frecuentes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-rural-background"
                />
              </div>

              {/* Categorías rápidas */}
              <div className="flex flex-wrap gap-2">
                {['Todos', 'Animales', 'Compras', 'Ventas', 'Sanidad', 'Sistema'].map((categoria) => (
                  <button
                    key={categoria}
                    onClick={() => setSearchTerm(categoria === 'Todos' ? '' : categoria)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      (categoria === 'Todos' && searchTerm === '') || searchTerm === categoria
                        ? 'bg-rural-primary text-white'
                        : 'bg-rural-alternate/20 text-rural-text hover:bg-rural-alternate/40'
                    }`}
                  >
                    {categoria}
                  </button>
                ))}
              </div>

              {/* Lista de FAQ */}
              <div className="space-y-3">
                {filteredFaq.length === 0 ? (
                  <div className="text-center py-8">
                    <HelpCircle className="h-16 w-16 text-rural-primary/40 mx-auto mb-4" />
                    <p className="text-rural-text/60">No se encontraron preguntas que coincidan con tu búsqueda</p>
                  </div>
                ) : (
                  filteredFaq.map((faq) => {
                    const Icon = faq.icon;
                    const isExpanded = expandedFaq === faq.id;
                    
                    return (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-rural-background rounded-xl border border-rural-alternate/30"
                      >
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full p-4 text-left flex items-center justify-between hover:bg-rural-alternate/10 transition-colors rounded-xl"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-rural-primary/10 rounded-lg">
                              <Icon className="h-4 w-4 text-rural-primary" />
                            </div>
                            <div>
                              <span className="inline-block px-2 py-1 bg-rural-primary/10 text-rural-primary text-xs font-medium rounded-full mr-3">
                                {faq.categoria}
                              </span>
                              <span className="text-rural-text font-medium">{faq.pregunta}</span>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-rural-text/60" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-rural-text/60" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-0">
                                <div className="pl-12 pr-8">
                                  <p className="text-rural-text/80 leading-relaxed">{faq.respuesta}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {/* Tab Tutorial */}
          {activeTab === 'tutorial' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-rural-text mb-2">Tutorial Paso a Paso</h3>
                <p className="text-rural-text/60">
                  Aprende a usar todas las funciones del sistema de gestión ganadera
                </p>
              </div>

              {/* Video principal (placeholder) */}
              <div className="bg-gradient-to-r from-rural-primary/10 to-rural-secondary/10 rounded-xl p-8 text-center">
                <PlayCircle className="h-16 w-16 text-rural-primary mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-rural-text mb-2">Video Tutorial Completo</h4>
                <p className="text-rural-text/60 mb-4">Guía completa de 45 minutos sobre todas las funciones</p>
                <button className="bg-rural-primary text-white px-6 py-3 rounded-xl hover:bg-rural-primary/90 transition-colors flex items-center space-x-2 mx-auto">
                  <PlayCircle className="h-5 w-5" />
                  <span>Ver Video Tutorial</span>
                </button>
              </div>

              {/* Módulos del tutorial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutorialSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-rural-background rounded-xl p-6 border border-rural-alternate/30 hover:border-rural-primary/30 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-rural-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {step.id}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-rural-text">{step.titulo}</h4>
                          <span className="text-xs text-rural-text/60 bg-rural-alternate/20 px-2 py-1 rounded-full">
                            {step.duracion}
                          </span>
                        </div>
                        <p className="text-rural-text/60 text-sm mb-3">{step.descripcion}</p>
                        <div className="space-y-1">
                          {step.temas.map((tema, i) => (
                            <div key={i} className="flex items-center space-x-2 text-xs text-rural-text/60">
                              <div className="w-1 h-1 bg-rural-primary rounded-full"></div>
                              <span>{tema}</span>
                            </div>
                          ))}
                        </div>
                        <button className="mt-4 text-rural-primary hover:underline text-sm font-medium flex items-center space-x-1">
                          <PlayCircle className="h-4 w-4" />
                          <span>Ver módulo</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Recursos adicionales */}
              <div className="bg-rural-alternate/10 rounded-xl p-6">
                <h4 className="font-semibold text-rural-text mb-4 flex items-center space-x-2">
                  <Book className="h-5 w-5 text-rural-primary" />
                  <span>Recursos Adicionales</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a href="#" className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-rural-alternate/10 transition-colors">
                    <FileText className="h-5 w-5 text-rural-primary" />
                    <div>
                      <div className="font-medium text-rural-text">Manual de Usuario PDF</div>
                      <div className="text-sm text-rural-text/60">Descarga la guía completa</div>
                    </div>
                    <Download className="h-4 w-4 text-rural-text/60" />
                  </a>
                  <a href="#" className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-rural-alternate/10 transition-colors">
                    <ExternalLink className="h-5 w-5 text-rural-primary" />
                    <div>
                      <div className="font-medium text-rural-text">Videos en YouTube</div>
                      <div className="text-sm text-rural-text/60">Canal oficial con tutoriales</div>
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab Contacto */}
          {activeTab === 'contacto' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-rural-text mb-2">Contacto y Soporte</h3>
                <p className="text-rural-text/60">
                  Estamos aquí para ayudarte. Contactanos por cualquier consulta o problema técnico
                </p>
              </div>

              {/* Información de contacto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-rural-background rounded-xl p-6 border border-rural-alternate/30">
                  <div className="flex items-center space-x-3 mb-4">
                    <Phone className="h-6 w-6 text-rural-primary" />
                    <h4 className="font-semibold text-rural-text">Teléfono</h4>
                  </div>
                  <p className="text-rural-text text-lg font-medium mb-2">{contactInfo.telefono}</p>
                  <p className="text-rural-text/60 text-sm">WhatsApp disponible</p>
                </div>

                <div className="bg-rural-background rounded-xl p-6 border border-rural-alternate/30">
                  <div className="flex items-center space-x-3 mb-4">
                    <Mail className="h-6 w-6 text-rural-primary" />
                    <h4 className="font-semibold text-rural-text">Email</h4>
                  </div>
                  <p className="text-rural-text text-lg font-medium mb-2">{contactInfo.email}</p>
                  <p className="text-rural-text/60 text-sm">Respuesta en 24 horas</p>
                </div>

                <div className="bg-rural-background rounded-xl p-6 border border-rural-alternate/30">
                  <div className="flex items-center space-x-3 mb-4">
                    <MapPin className="h-6 w-6 text-rural-primary" />
                    <h4 className="font-semibold text-rural-text">Ubicación</h4>
                  </div>
                  <p className="text-rural-text text-lg font-medium mb-2">{contactInfo.direccion}</p>
                  <p className="text-rural-text/60 text-sm">Visitas con cita previa</p>
                </div>

                <div className="bg-rural-background rounded-xl p-6 border border-rural-alternate/30">
                  <div className="flex items-center space-x-3 mb-4">
                    <Clock className="h-6 w-6 text-rural-primary" />
                    <h4 className="font-semibold text-rural-text">Horarios</h4>
                  </div>
                  <p className="text-rural-text text-lg font-medium mb-2">{contactInfo.horarios}</p>
                  <p className="text-rural-text/60 text-sm">Emergencias 24/7</p>
                </div>
              </div>

              {/* Formulario de contacto */}
              <div className="bg-rural-alternate/10 rounded-xl p-6">
                <h4 className="font-semibold text-rural-text mb-4 flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-rural-primary" />
                  <span>Enviar Consulta</span>
                </h4>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-rural-text mb-2">Nombre</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-white"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-rural-text mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-white"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-rural-text mb-2">Asunto</label>
                    <select className="w-full px-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-white">
                      <option value="">Selecciona el tipo de consulta</option>
                      <option value="tecnico">Problema técnico</option>
                      <option value="uso">Ayuda con el uso</option>
                      <option value="sugerencia">Sugerencia</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-rural-text mb-2">Mensaje</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 border border-rural-alternate rounded-xl focus:ring-2 focus:ring-rural-primary focus:border-transparent transition-colors bg-white resize-none"
                      placeholder="Describe tu consulta o problema..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="bg-rural-primary text-white px-6 py-3 rounded-xl hover:bg-rural-primary/90 transition-colors flex items-center space-x-2"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Enviar Consulta</span>
                  </button>
                </form>
              </div>

              {/* Tips rápidos */}
              <div className="bg-gradient-to-r from-rural-primary/5 to-rural-secondary/5 rounded-xl p-6 border border-rural-primary/10">
                <h4 className="font-semibold text-rural-text mb-4 flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-rural-primary" />
                  <span>Tips para un Soporte Más Rápido</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-rural-primary rounded-full mt-2"></div>
                    <span className="text-rural-text/80">Describe el problema paso a paso</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-rural-primary rounded-full mt-2"></div>
                    <span className="text-rural-text/80">Incluye capturas de pantalla si es posible</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-rural-primary rounded-full mt-2"></div>
                    <span className="text-rural-text/80">Menciona qué navegador estás usando</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-rural-primary rounded-full mt-2"></div>
                    <span className="text-rural-text/80">Indica si es urgente o puede esperar</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ayuda;