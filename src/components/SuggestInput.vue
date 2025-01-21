<template>
  <div class="suggest-input-container">
    <input 
      type="text" 
      v-model.trim="searchQuery" 
      :placeholder="label" ref="inputRef"
      @keydown.down.prevent="selectNextSuggestion" 
      @keydown.up.prevent="selectPreviousSuggestion"
      @keydown.enter.prevent="applySelectedSuggestion" 
      @focus="showSuggestions = true"
      @blur="hideSuggestionsAfterDelay" 
    />

    <div 
      class="selected-entities" 
      v-if="selectedEntities.length > 0"
    >
      <span 
        v-for="entity in selectedEntities" 
        :key="entity.id" 
        class="tag" 
        role="button" 
        tabindex="0"
        @click="removeEntity(entity)" 
        @keydown.delete="removeEntity(entity)"
      >
        {{ entity.alias }}

        <span class="close-button">
          ×
        </span>
      </span>
    </div>

    <ul 
      v-show="showSuggestions && suggestions.length > 0" 
      class="suggestions-dropdown" 
      role="listbox"
      aria-label="Suggestions list"
    >
      <li 
        v-for="(suggestion, index) in visibleSuggestions" 
        :key="suggestion.id"
        :class="{ active: currentIndex === index }" 
        role="option" 
        @mouseenter="currentIndex = index"
        @click="selectSuggestion(suggestion)" 
        tabindex="0"
      >
        <component 
          :is="getEntityComponent(suggestion.type)" 
          :entity="suggestion" 
        />
      </li>
    </ul>

    <div 
      v-if="loading" 
      class="loader"/>

    <p 
      v-if="error" 
      class="error-message"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, nextTick } from 'vue';
import axios from 'axios';
import UserEntity from '@/components/UserEntity.vue';
import CompanyEntity from '@/components/CompanyEntity.vue';
import { EntityPropsInterface } from '@/interfaces/EntityProps';
import { MAX_SUGGESTIONS, DEBOUNCE_DELAY } from '@/constants/suggest-input-constants';
import { tymeOutIdType } from '@/types/tymeOutIdType';

export default defineComponent({
  props: {
    label: {
      type: String,
      default: 'Search...',
    },
    maxEntities: {
      type: Number,
      default: 1,
    },
  },
  emits: ['update'],
  components: {
    UserEntity,
    CompanyEntity,
  },
  setup(props, { emit }) {
    const searchQuery = ref('');
    const inputRef = ref<HTMLInputElement>();
    const showSuggestions = ref(false);
    const loading = ref(false);
    const error = ref(false);
    const errorMessage = ref('Something went wrong.');
    const suggestions = ref<EntityPropsInterface[]>([]);
    const selectedEntities = ref<EntityPropsInterface[]>([]);
    const currentIndex = ref(-1);
    let timeoutId: tymeOutIdType = null;
    let cancelTokenSource = axios.CancelToken.source();

    const visibleSuggestions = computed(() => {
      return suggestions.value ? suggestions.value.slice(0, MAX_SUGGESTIONS) : []
    } );

    watch(searchQuery, async (newValue) => {
      if (timeoutId !== null) clearTimeout(timeoutId);
      if (newValue.length >= 3) {
        timeoutId = setTimeout(async () => {
          await fetchSuggestions(newValue);
        }, DEBOUNCE_DELAY);
      }
    });

    const fetchSuggestions = async (query: string) => {
      try {
        loading.value = true;
        cancelTokenSource.cancel('Operation canceled due to new request.');
        cancelTokenSource = axios.CancelToken.source();
        const { data } = await axios.get(
          'https://habr.com/kek/v2/publication/suggest-mention',
          {
            params: { q: query },
            cancelToken: cancelTokenSource.token,
          }
        );

        suggestions.value = data.data;
        loading.value = false;
        error.value = false;
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error('Error fetching suggestions:', err);
          error.value = true;
          loading.value = false;
        }
      }
    };

    const selectNextSuggestion = () => {
      if (currentIndex.value < visibleSuggestions.value.length - 1) {
        currentIndex.value++;
      } else {
        currentIndex.value = 0;
      }
    };

    const selectPreviousSuggestion = () => {
      if (currentIndex.value <= 0) {
        currentIndex.value = visibleSuggestions.value.length - 1;
      } else {
        currentIndex.value--;
      }
    };

    const applySelectedSuggestion = () => {
      if (currentIndex.value !== -1) {
        selectSuggestion(visibleSuggestions.value[currentIndex.value]);
      }
    };

    const hideSuggestionsAfterDelay = () => {
      setTimeout(() => {
        showSuggestions.value = false;
      }, 100);
    };

    const removeEntity = (entity: EntityPropsInterface) => {
      selectedEntities.value = selectedEntities.value.filter((ent) => ent.id !== entity.id);
      updateInputField();
    };

    const updateInputField = () => {
      const aliases = selectedEntities.value.map((entity) => `${entity.alias}@`);
      inputRef.value!.value = aliases.join(' ');
      emit('update', selectedEntities.value);
    };

    const getEntityComponent = (type: 'user' | 'company') => {
      return type === 'user' ? 'UserEntity' : 'CompanyEntity';
    };

    const selectSuggestion = (suggestion: EntityPropsInterface) => {
      if (selectedEntities.value.find((entity) => entity.alias === suggestion.alias)) return;
      
      if (props.maxEntities === 1 || !props.maxEntities) {
        selectedEntities.value = [suggestion];
      } else {
        selectedEntities.value.push(suggestion);
      }
      updateInputField();
      showSuggestions.value = false;
      nextTick(() => inputRef.value?.focus());
    };

    return {
      searchQuery,
      inputRef,
      showSuggestions,
      loading,
      error,
      errorMessage,
      suggestions,
      selectedEntities,
      currentIndex,
      visibleSuggestions,
      selectNextSuggestion,
      selectPreviousSuggestion,
      applySelectedSuggestion,
      hideSuggestionsAfterDelay,
      removeEntity,
      getEntityComponent,
      selectSuggestion,
    };
  },
});
</script>

<style scoped>
.suggest-input-container {
  position: relative;
  display: inline-block;
}

input {
  width: 250px;
  padding: 10px;
  border: 1px solid #ccc;
  outline: none;
  box-sizing: border-box;
}

.selected-entities {
  margin-top: 5px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  background-color: #f0f0f0;
  padding: 5px 10px;
  border-radius: 20px;
  cursor: pointer;
  user-select: none;
}

.close-button {
  margin-left: 5px;
  font-size: 12px;
  line-height: 14px;
}

.suggestions-dropdown {
  position: absolute;
  top: 45px;
  left: 0;
  right: 0;
  z-index: 99;
  max-height: 200px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #ccc;
  list-style-type: none;
  padding: 0;
  margin: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.suggestions-dropdown li {
  padding: 10px;
  cursor: pointer;
}

.suggestions-dropdown li.active {
  background-color: #f0f0f0;
}

.loader {
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 16px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  color: red;
  margin-top: 5px;
}
</style>