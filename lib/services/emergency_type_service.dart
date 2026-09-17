import 'dart:convert';

import 'package:http/http.dart' as http;

import 'package:emergency_app/models/emergency_type.dart';
import 'package:emergency_app/utils/parameters.dart';

/// Talks to the backend's /api/emergencyTypes endpoint.
class EmergencyTypeService {
  static Future<List<EmergencyType>> fetchEmergencyTypes() async {
    final uri = Uri.parse('${Parameters.apiBaseUrl}/api/emergencyTypes');

    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body) as List<dynamic>;
      return decoded
          .map((item) => EmergencyType.fromJson(item as Map<String, dynamic>))
          .toList();
    }

    throw Exception(
      'Failed to load emergency types (status ${response.statusCode}): ${response.body}',
    );
  }

  static Future<EmergencyType> fetchEmergencyType(int id) async {
    final uri = Uri.parse('${Parameters.apiBaseUrl}/api/emergencyTypes/$id');

    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body) as Map<String, dynamic>;
      return EmergencyType.fromJson(decoded);
    }

    throw Exception(
      'Failed to load emergency type (status ${response.statusCode}): ${response.body}',
    );
  }

  static Future<Map<String, dynamic>> createEmergencyType(String name) async {
    final uri = Uri.parse('${Parameters.apiBaseUrl}/api/emergencyTypes');

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'name': name}),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }

    throw Exception(
      'Failed to create emergency type (status ${response.statusCode}): ${response.body}',
    );
  }

  static Future<bool> updateEmergencyType(int id, String name) async {
    final uri = Uri.parse('${Parameters.apiBaseUrl}/api/emergencyTypes/$id');

    final response = await http.put(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'name': name}),
    );

    if (response.statusCode == 200) {
      return true;
    }

    throw Exception(
      'Failed to update emergency type (status ${response.statusCode}): ${response.body}',
    );
  }

  static Future<bool> deleteEmergency(int id) async {
    final uri = Uri.parse('${Parameters.apiBaseUrl}/api/emergencyTypes/$id');

    final response = await http.delete(uri);

    if (response.statusCode == 200) {
      return true;
    }

    throw Exception(
      'Failed to delete emergency type (status ${response.statusCode}): ${response.body}',
    );
  }
}
