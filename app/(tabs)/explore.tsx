// Este componente maneja toda la funcionalidad de mi pantalla de notas: agregar, editar, borrar, etc.
import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  Animated,
  Modal,
} from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol'; // Icono decorativo
import { Ionicons } from '@expo/vector-icons'; // Íconos para editar y borrar

interface Note {
  id: string;
  text: string;
}

export default function NotesScreen() {
  // Donde guardo todas las notas
  const [notes, setNotes] = useState<Note[]>([]);
  // Este estado guarda el texto que escribo
  const [input, setInput] = useState('');
  // Cuando edito una nota, la guardo aquí
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  // Esto controla si el modal de edición está visible o no
  const [modalVisible, setModalVisible] = useState(false);
  // Animación para cuando agrego una nota nueva
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Esta animación le da vida a las notas cuando se agregan
  const animateNote = () => {
    scaleAnim.setValue(0.7);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  // Agrego una nueva nota a la lista
  const addNote = () => {
    const trimmed = input.trim();
    if (trimmed.length === 0 || trimmed.length > 200) return;
    const newNote = { id: Date.now().toString(), text: trimmed };
    setNotes([newNote, ...notes]);
    setInput('');
    animateNote();
  };

  // Elimino una nota por su id
  const removeNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  // Inicio el proceso de edición de una nota
  const startEditNote = (note: Note) => {
    setEditingNote(note);
    setInput(note.text);
    setModalVisible(true);
  };

  // Guardo los cambios hechos a una nota
  const saveEditNote = () => {
    if (editingNote) {
      const updated = notes.map(note =>
        note.id === editingNote.id ? { ...note, text: input.trim() } : note
      );
      setNotes(updated);
      setEditingNote(null);
      setModalVisible(false);
      setInput('');
    }
  };

  // Cancelo la edición de una nota
  const cancelEdit = () => {
    setModalVisible(false);
    setEditingNote(null);
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Sección superior con título y subtítulo */}
      <View style={styles.header}>
        <View style={styles.headerCard}>
          <IconSymbol
            size={64}
            color="#ffffff"
            name="note.text"
            style={styles.icon}
          />
          <Text style={styles.title}>Mis Notas</Text>
          <Text style={styles.subtitle}>Organiza tus ideas con estilo</Text>
        </View>
      </View>

      {/* Lista de todas las notas */}
      <FlatList
        data={notes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Animated.View style={{ ...styles.noteItem, transform: [{ scale: scaleAnim }] }}>
            <Text style={styles.noteText}>{item.text}</Text>
            <View style={styles.noteActions}>
              <TouchableOpacity onPress={() => startEditNote(item)}>
                <Ionicons name="create-outline" size={20} color="#558b2f" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeNote(item.id)} style={{ marginLeft: 12 }}>
                <Ionicons name="trash-bin-outline" size={20} color="#c62828" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay notas aún. ¡Empieza a escribir!</Text>
        }
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
      />

      {/* Modal que se abre al editar una nota */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Nota</Text>
            <TextInput
              style={styles.modalInput}
              value={input}
              onChangeText={setInput}
              placeholder="Edita tu nota"
              placeholderTextColor="#999"
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={cancelEdit}>
                <Text style={styles.cancelButton}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEditNote}>
                <Text style={styles.saveButton}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Zona para escribir nueva nota y botón de agregar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe una nota..."
          placeholderTextColor="#666"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={editingNote ? saveEditNote : addNote}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={styles.fab}
          onPress={editingNote ? saveEditNote : addNote}
          activeOpacity={0.8}
        >
          <Ionicons name={editingNote ? 'checkmark' : 'add'} size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// 🎨 Todos los estilos de mi interfaz
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#e8f5e9', // Verde muy claro, casi blanco
  },
  header: {
    marginBottom: 20,
  },
  headerCard: {
    backgroundColor: '#a5d6a7', // Verde pálido muy elegante
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32', // Verde profundo y elegante
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#33691e', // Verde más oscuro para contraste
    fontStyle: 'italic',
    marginTop: 6,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingRight: 10,
  },
  fab: {
    backgroundColor: '#66bb6a', // Verde suave
    borderRadius: 24,
    padding: 10,
  },
  noteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  noteText: {
    fontSize: 16,
    color: '#444',
    flex: 1,
  },
  noteActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 48,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2e7d32',
  },
  modalInput: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    color: '#999',
    marginRight: 16,
  },
  saveButton: {
    color: '#388e3c',
    fontWeight: 'bold',
  },
});
