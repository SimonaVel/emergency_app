import 'package:flutter/material.dart';
import 'package:emergency_app/models/emergency_type.dart';
import 'package:emergency_app/services/emergency_type_service.dart';
import 'package:emergency_app/widgets/main_elements.dart';
import 'package:emergency_app/screens/add_emergency_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '211 Emergency application',
      theme: ThemeData(
        colorScheme: .fromSeed(seedColor: const Color.fromARGB(255, 183, 58, 58)),
      ),
      home: const MyHomePage(title: '211 Emergency application home page'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  late Future<List<EmergencyType>> _emergencyTypesFuture;

  @override
  void initState() {
    super.initState();
    _emergencyTypesFuture = EmergencyTypeService.fetchEmergencyTypes();
  }

  void _refreshEmergencyTypes() {
    setState(() {
      _emergencyTypesFuture = EmergencyTypeService.fetchEmergencyTypes();
    });
  }

  Future<void> _openAddEmergencyScreen() async {
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => const AddEmergencyTypeScreen()),
    );

    if (created == true && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Emergency added')),
      );
      _refreshEmergencyTypes();
    }
  }

  @override
  Widget build(BuildContext context) {
    // This method is rerun every time setState is called
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: Center(
        child: FutureBuilder<List<EmergencyType>>(
          future: _emergencyTypesFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const CircularProgressIndicator();
            }
            if (snapshot.hasError) {
              // return Text('Could not load emergency types: ${snapshot.error}');
              return const Text('Could not load emergency types. Please run the backend server and try again. (npm run backend:dev)');
            }

            final emergencyTypes = snapshot.data ?? const <EmergencyType>[];
            if (emergencyTypes.isEmpty) {
              return const Text('No emergency types yet.');
            }

            return GridView.count(
              crossAxisCount: 2,
              children: emergencyTypes.map((emergencyType) {
                return EmergencyButton(
                  id: emergencyType.id.toString(),
                  text: emergencyType.name,
                  onPressed: () {
                    // _handleEmergency(emergency.id);
                  },
                );
              }).toList(),
            );
          },
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        key: const Key('add_emergency_type_button'),
        onPressed: _openAddEmergencyScreen,
        icon: const Icon(Icons.add),
        label: const Text('Add emergency type'),
      ),
    );
  }
}
