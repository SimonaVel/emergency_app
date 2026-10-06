import 'package:flutter/material.dart';
import 'package:emergency_app/models/emergency.dart' as emergency_model;
import 'package:emergency_app/models/emergency_type.dart';
import 'package:emergency_app/services/emergency_service.dart';
import 'package:emergency_app/services/emergency_type_service.dart';
import 'package:emergency_app/widgets/main_elements.dart';
import 'package:emergency_app/screens/add_emergency_screen.dart';
import 'package:emergency_app/screens/user_info_screen.dart';

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
        colorScheme: .fromSeed(
          seedColor: const Color.fromARGB(255, 183, 58, 58),
        ),
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
  late Future<List<Emergency>> _emergencyTypesFuture;
  String _userName = '';
  String _phoneNumber = '';

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

  Future<void> _showEmergenciesForType(int typeId, String typeName) async {
    final emergenciesFuture = EmergencyService.fetchEmergencies().then(
      (emergencies) => emergencies
          .where((emergency) => emergency.emergencyTypeId == typeId)
          .toList(),
    );

    final selectedEmergency = await showDialog<emergency_model.Emergency>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text('Report $typeName'),
        content: SizedBox(
          width: double.maxFinite,
          height: 300,
          child: FutureBuilder<List<emergency_model.Emergency>>(
            future: emergenciesFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }
              if (snapshot.hasError) {
                return const Center(
                  child: Text('Could not load emergencies. Please try again.'),
                );
              }

              final emergencies = snapshot.data ?? const [];
              if (emergencies.isEmpty) {
                return const Center(
                  child: Text('No emergencies available for this type.'),
                );
              }

              return ListView.separated(
                itemCount: emergencies.length,
                separatorBuilder: (_, _) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final emergency = emergencies[index];
                  return ListTile(
                    title: Text(emergency.name),
                    onTap: () => Navigator.of(dialogContext).pop(emergency),
                  );
                },
              );
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('Go back'),
          ),
        ],
      ),
    );

    if (selectedEmergency != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Selected: ${selectedEmergency.name}')),
      );
    }
  }

  Future<void> _openAddEmergencyScreen() async {
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => const AddEmergencyTypeScreen()),
    );

    if (created == true && mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Emergency added')));
      _refreshEmergencyTypes();
    }
  }

  Future<void> _openUserInfoScreen() async {
    final userInfo = await Navigator.of(context).push<UserInfo>(
      MaterialPageRoute(
        builder: (_) => UserInfoScreen(
          initialName: _userName,
          initialPhoneNumber: _phoneNumber,
        ),
      ),
    );

    if (userInfo == null || !mounted) return;

    setState(() {
      _userName = userInfo.name;
      _phoneNumber = userInfo.phoneNumber;
    });
  }

  @override
  Widget build(BuildContext context) {
    // This method is rerun every time setState is called
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
        actions: [
          IconButton(
            key: const Key('user_info_button'),
            tooltip: 'User information',
            onPressed: _openUserInfoScreen,
            icon: const Icon(Icons.person_outline),
          ),
        ],
      ),
      body: Center(
        child: FutureBuilder<List<Emergency>>(
          future: _emergencyTypesFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const CircularProgressIndicator();
            }
            if (snapshot.hasError) {
              // return Text('Could not load emergency types: ${snapshot.error}');
              return const Text(
                'Could not load emergency types. Please run the backend server and try again. (npm run backend:dev)',
              );
            }

            final emergencyTypes = snapshot.data ?? const <Emergency>[];
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
                    _showEmergenciesForType(
                      emergencyType.id,
                      emergencyType.name,
                    );
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
