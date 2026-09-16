import 'package:flutter/material.dart';
import 'package:emergency_app/models/emergency.dart';
import 'package:emergency_app/services/emergency_service.dart';
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

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  late Future<List<Emergency>> _emergenciesFuture;

  @override
  void initState() {
    super.initState();
    _emergenciesFuture = EmergencyService.fetchEmergencies();
  }

  void _refreshEmergencies() {
    setState(() {
      _emergenciesFuture = EmergencyService.fetchEmergencies();
    });
  }

  Future<void> _openAddEmergencyScreen() async {
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => const AddEmergencyScreen()),
    );

    if (created == true && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Emergency added')),
      );
      _refreshEmergencies();
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
        child: FutureBuilder<List<Emergency>>(
          future: _emergenciesFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const CircularProgressIndicator();
            }
            if (snapshot.hasError) {
              return Text('Could not load emergencies: ${snapshot.error}');
            }

            final emergencies = snapshot.data ?? const <Emergency>[];
            if (emergencies.isEmpty) {
              return const Text('No emergencies yet.');
            }

            return GridView.count(
              crossAxisCount: 2,
              children: emergencies.map((emergency) {
                return EmergencyButton(
                  id: emergency.id.toString(),
                  text: emergency.name,
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
        key: const Key('add_emergency_button'),
        onPressed: _openAddEmergencyScreen,
        icon: const Icon(Icons.add),
        label: const Text('Add emergency'),
      ),
    );
  }
}
