'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Radio, Store, MessageCircle, Truck, DollarSign, 
  Target, CheckCircle2, Clock, AlertCircle, ChevronRight,
  Phone, Mail, MapPin, Calendar, Zap, TrendingUp
} from 'lucide-react';

// Phase data
const phases = [
  {
    id: 1,
    name: 'Foundation',
    duration: 'Weeks 1-4',
    status: 'not_started',
    progress: 0,
    tasks: [
      { id: 't1', task: 'Contact NASASA (info@nasasa.co.za, 087 470 0884)', done: false, priority: 'critical' },
      { id: 't2', task: 'Set up WhatsApp Business API (via Wati or CellFind)', done: false, priority: 'critical' },
      { id: 't3', task: 'Create demand capture flow: voice notes → product requests', done: false, priority: 'high' },
      { id: 't4', task: 'Design cash-on-delivery system with spaza pickup points', done: false, priority: 'high' },
      { id: 't5', task: 'Build stokvel group registration portal', done: false, priority: 'medium' },
      { id: 't6', task: 'Create agent recruitment landing page (target: stokvel chairs)', done: false, priority: 'medium' },
    ]
  },
  {
    id: 2,
    name: 'Pilot Launch',
    duration: 'Weeks 5-8',
    status: 'locked',
    progress: 0,
    tasks: [
      { id: 't7', task: 'Recruit 10 community agents in Soweto', done: false, priority: 'critical' },
      { id: 't8', task: 'Partner with 5 spaza shops as pickup points', done: false, priority: 'critical' },
      { id: 't9', task: 'Run first stokvel bulk order (target: 1 group, 20+ members)', done: false, priority: 'high' },
      { id: 't10', task: 'Book Jozi FM interview/ad spot (564k listeners)', done: false, priority: 'high' },
      { id: 't11', task: 'Test China-to-Joburg-to-spaza delivery pipeline', done: false, priority: 'high' },
      { id: 't12', task: 'Collect 50+ "wants" from township residents', done: false, priority: 'medium' },
    ]
  },
  {
    id: 3,
    name: 'Scale',
    duration: 'Weeks 9-12',
    status: 'locked',
    progress: 0,
    tasks: [
      { id: 't13', task: 'Expand to Alexandra and Tembisa', done: false, priority: 'high' },
      { id: 't14', task: 'Recruit 50 total agents across 3 townships', done: false, priority: 'high' },
      { id: 't15', task: 'Partner with 20 spaza shops', done: false, priority: 'high' },
      { id: 't16', task: 'Launch taxi rank presence at Bara (70% Soweto commuters)', done: false, priority: 'medium' },
      { id: 't17', task: 'Run stokvel bulk order campaign for festive season', done: false, priority: 'critical' },
      { id: 't18', task: 'Process 500+ wants, fulfill 100+ orders', done: false, priority: 'high' },
    ]
  }
];

// Key contacts
const contacts = [
  { org: 'NASASA', role: 'Stokvel Association', phone: '087 470 0884', email: 'info@nasasa.co.za', priority: 'critical' },
  { org: 'Jozi FM', role: 'Community Radio', phone: '011 938 1058', email: 'info@jozifm.co.za', priority: 'high' },
  { org: 'Alex FM', role: 'Community Radio', phone: '011 882 3674', email: 'info@alexfm.co.za', priority: 'high' },
  { org: 'Wati', role: 'WhatsApp API', phone: null, email: 'sales@wati.io', priority: 'medium' },
];

// Market stats
const stats = [
  { label: 'Township Economy', value: 'R900B', icon: DollarSign, color: 'text-green-600' },
  { label: 'Stokvel Members', value: '11.5M', icon: Users, color: 'text-blue-600' },
  { label: 'Spaza Shops', value: '150K+', icon: Store, color: 'text-purple-600' },
  { label: 'WhatsApp Business Use', value: '74%', icon: MessageCircle, color: 'text-emerald-600' },
  { label: 'Cash Transactions', value: '90%', icon: Truck, color: 'text-orange-600' },
  { label: 'Stokvel Annual Pool', value: 'R50B', icon: TrendingUp, color: 'text-red-600' },
];

// Product opportunities
const productOpportunities = [
  { category: 'Electronics', items: 'Smartphones, accessories, small appliances', margin: 'High', demand: 'Very High' },
  { category: 'Household', items: 'Kitchenware, storage, bedding, cleaning', margin: 'Medium', demand: 'High' },
  { category: 'Hair & Beauty', items: 'Natural hair products, skincare for melanin-rich skin', margin: 'High', demand: 'High' },
  { category: 'Fashion', items: 'Clothing, accessories (Shein/Temu competitor)', margin: 'Medium', demand: 'Very High' },
  { category: 'Building Materials', items: 'Tiles, fixtures, tools', margin: 'Medium', demand: 'Medium' },
];

// Stokvel calendar
const stokvelCalendar = [
  { month: 'January-February', activity: 'New stokvel accounts open', action: 'Recruit groups, establish relationships' },
  { month: 'March-October', activity: 'Regular contributions', action: 'Build trust with smaller deliveries' },
  { month: 'November', activity: 'Pre-festive bulk ordering', action: 'Execute major stokvel orders' },
  { month: 'December', activity: 'Festive disbursement', action: 'Ensure delivery before Christmas' },
];

export default function TownshipStrategyPage() {
  const [activePhase, setActivePhase] = useState(1);
  const [tasks, setTasks] = useState(phases);

  const toggleTask = (phaseId: number, taskId: string) => {
    setTasks(prev => prev.map(phase => {
      if (phase.id !== phaseId) return phase;
      const updatedTasks = phase.tasks.map(t => 
        t.id === taskId ? { ...t, done: !t.done } : t
      );
      const progress = Math.round((updatedTasks.filter(t => t.done).length / updatedTasks.length) * 100);
      return { ...phase, tasks: updatedTasks, progress };
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Township Market Strategy</h1>
          <p className="text-muted-foreground mt-1">
            Johannesburg: Soweto, Alexandra, Tembisa, Diepsloot, Orange Farm
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Target: R900B Economy
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="roadmap" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="roadmap">🎯 Roadmap</TabsTrigger>
          <TabsTrigger value="channels">📡 Channels</TabsTrigger>
          <TabsTrigger value="products">📦 Products</TabsTrigger>
          <TabsTrigger value="stokvels">👥 Stokvels</TabsTrigger>
          <TabsTrigger value="contacts">📞 Contacts</TabsTrigger>
        </TabsList>

        {/* ROADMAP TAB */}
        <TabsContent value="roadmap" className="space-y-4">
          {/* Phase Selector */}
          <div className="flex gap-2">
            {tasks.map((phase) => (
              <Button
                key={phase.id}
                variant={activePhase === phase.id ? 'default' : 'outline'}
                onClick={() => setActivePhase(phase.id)}
                className="flex-1"
              >
                <span className="mr-2">Phase {phase.id}</span>
                <Badge variant="secondary" className="ml-auto">
                  {phase.progress}%
                </Badge>
              </Button>
            ))}
          </div>

          {/* Active Phase Details */}
          {tasks.filter(p => p.id === activePhase).map((phase) => (
            <Card key={phase.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Phase {phase.id}: {phase.name}</CardTitle>
                    <CardDescription>{phase.duration}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{phase.progress}%</div>
                    <Progress value={phase.progress} className="w-32 mt-1" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {phase.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        task.done ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleTask(phase.id, task.id)}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        task.done ? 'bg-green-500 border-green-500' : 'border-gray-300'
                      }`}>
                        {task.done && <CheckCircle2 className="h-4 w-4 text-white" />}
                      </div>
                      <span className={task.done ? 'line-through text-muted-foreground' : ''}>
                        {task.task}
                      </span>
                      <Badge className={`ml-auto ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* CHANNELS TAB */}
        <TabsContent value="channels" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* WhatsApp */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  WhatsApp Commerce
                </CardTitle>
                <CardDescription>74% of township businesses use WhatsApp for trade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium">How It Works</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Voice notes for product requests</li>
                    <li>• Catalogs for product discovery</li>
                    <li>• Location pins for pickup points</li>
                    <li>• Broadcast lists for deals</li>
                  </ul>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium">API Providers</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Wati (sales@wati.io)</li>
                    <li>• CellFind</li>
                    <li>• CM.com</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Community Radio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-purple-600" />
                  Community Radio
                </CardTitle>
                <CardDescription>Listeners don't switch stations during ads</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Jozi FM (105.8)</h4>
                      <p className="text-sm text-muted-foreground">Soweto, Kagiso, Lenasia</p>
                    </div>
                    <Badge variant="secondary">564K listeners</Badge>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Alex FM (89.1)</h4>
                      <p className="text-sm text-muted-foreground">Alexandra, Tembisa</p>
                    </div>
                    <Badge variant="secondary">130K listeners</Badge>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Voice of Tembisa (87.6)</h4>
                      <p className="text-sm text-muted-foreground">Tembisa, Midrand</p>
                    </div>
                    <Badge variant="secondary">Township-focused</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Spaza Network */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-orange-600" />
                  Spaza Shop Network
                </CardTitle>
                <CardDescription>150K+ shops, 70% of households buy here</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-medium">Partnership Model</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Spaza becomes Jeffy pickup point</li>
                    <li>• Earns commission on collections</li>
                    <li>• Gets foot traffic boost</li>
                    <li>• Cash handling stays local</li>
                  </ul>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-medium">Their Pain Points (Our Opportunity)</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Products marked up 30-50% from wholesale</li>
                    <li>• Must travel to wholesalers themselves</li>
                    <li>• Limited buying power</li>
                    <li>• Frequent stockouts</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Taxi Ranks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  Taxi Rank Presence
                </CardTitle>
                <CardDescription>More traffic than OR Tambo Airport</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Baragwanath (Bara)</h4>
                      <p className="text-sm text-muted-foreground">70% of Soweto commuters</p>
                    </div>
                    <Badge variant="secondary">500 trader spaces</Badge>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Bree Street Rank</h4>
                      <p className="text-sm text-muted-foreground">CBD hub</p>
                    </div>
                    <Badge variant="secondary">150K daily</Badge>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Pan Africa (Alex)</h4>
                      <p className="text-sm text-muted-foreground">50,000m² complex</p>
                    </div>
                    <Badge variant="secondary">500 taxi bays</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PRODUCTS TAB */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>High-Demand Product Categories</CardTitle>
              <CardDescription>Based on township purchasing patterns and China sourcing advantages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productOpportunities.map((product) => (
                  <div key={product.category} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{product.category}</h4>
                      <p className="text-sm text-muted-foreground">{product.items}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={product.margin === 'High' ? 'default' : 'secondary'}>
                        {product.margin} Margin
                      </Badge>
                      <Badge variant={product.demand === 'Very High' ? 'destructive' : 'outline'}>
                        {product.demand} Demand
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Price Point Reality</CardTitle>
              <CardDescription>What the market can bear</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium">Median Income</h4>
                  <p className="text-2xl font-bold">R2,000/month</p>
                  <p className="text-sm text-muted-foreground">Informal sector</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium">Food Spend</h4>
                  <p className="text-2xl font-bold">34%</p>
                  <p className="text-sm text-muted-foreground">Of poor household income</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium">Cash Transactions</h4>
                  <p className="text-2xl font-bold">90%+</p>
                  <p className="text-sm text-muted-foreground">In spaza shops</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STOKVELS TAB */}
        <TabsContent value="stokvels" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Stokvel Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <div className="text-2xl font-bold">800K+</div>
                    <div className="text-sm text-muted-foreground">Groups in SA</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <div className="text-2xl font-bold">11.5M</div>
                    <div className="text-sm text-muted-foreground">Members</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <div className="text-2xl font-bold">R50B</div>
                    <div className="text-sm text-muted-foreground">Annual circulation</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <div className="text-2xl font-bold">23%</div>
                    <div className="text-sm text-muted-foreground">In Gauteng</div>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium">NASASA Database</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    125,000+ regulated groups representing 2.5M individuals
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4 mr-1" />
                      087 470 0884
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4 mr-1" />
                      info@nasasa.co.za
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Stokvel Calendar
                </CardTitle>
                <CardDescription>Time your campaigns right</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stokvelCalendar.map((period) => (
                    <div key={period.month} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{period.month}</h4>
                          <p className="text-sm text-muted-foreground">{period.activity}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                        <Zap className="h-4 w-4" />
                        {period.action}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stokvel Types & Purchasing Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <Badge className="mb-2">47%</Badge>
                  <h4 className="font-medium">Savings Stokvels</h4>
                  <p className="text-sm text-muted-foreground">Rotating savings, year-end payout</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Badge className="mb-2">41%</Badge>
                  <h4 className="font-medium">Burial Societies</h4>
                  <p className="text-sm text-muted-foreground">Funeral costs, ~R115/month avg</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Badge className="mb-2 bg-green-600">20%</Badge>
                  <h4 className="font-medium">Grocery Stokvels</h4>
                  <p className="text-sm text-muted-foreground">Bulk buying, Nov-Dec focus</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Badge className="mb-2">5%</Badge>
                  <h4 className="font-medium">Investment Stokvels</h4>
                  <p className="text-sm text-muted-foreground">Property, stocks, business</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTACTS TAB */}
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Contacts</CardTitle>
              <CardDescription>Priority outreach targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact.org} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{contact.org}</h4>
                        <Badge className={getPriorityColor(contact.priority)}>{contact.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{contact.role}</p>
                    </div>
                    <div className="flex gap-2">
                      {contact.phone && (
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4 mr-1" />
                          {contact.phone}
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4 mr-1" />
                        {contact.email}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Implementation Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                  <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-medium">Contact NASASA Today</h4>
                    <p className="text-sm text-muted-foreground">Gateway to 125K+ stokvel groups</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-medium">Set Up WhatsApp Business API</h4>
                    <p className="text-sm text-muted-foreground">Your primary commerce channel</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="font-medium">Recruit First 10 Agents in Soweto</h4>
                    <p className="text-sm text-muted-foreground">Target stokvel chairpersons</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <h4 className="font-medium">Partner with 5 Spaza Shops</h4>
                    <p className="text-sm text-muted-foreground">Pickup points for cash-on-delivery</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}