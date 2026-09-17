/// Mirrors the backend's Emergency entity (id + name).
class EmergencyType {
  final int id;
  final String name;

  const EmergencyType({required this.id, required this.name});

  factory EmergencyType.fromJson(Map<String, dynamic> json) {
    return EmergencyType(
      id: json['id'] as int,
      name: json['name'] as String,
    );
  }
}
