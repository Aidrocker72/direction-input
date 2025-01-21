<template>
  <div class="user-entity">
    <img 
      :src="entity.avatar || '/avatar.png'" 
      alt="Avatar" 
      class="avatar" 
    />

    <div class="user-entity__info">
      <div class="user-entity__name">{{ entity.name || entity.alias }}</div>
      <div class="user-entity__alias">@{{ entity.alias }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { EntityPropsInterface } from '@/interfaces/EntityProps';

export default defineComponent({
  props: {
    entity: {
      type: Object as PropType<EntityPropsInterface>,
      required: true,
    },
  },
});
</script>

<style scoped lang="scss">
.user-entity {
  display: flex;
  align-items: center;
  gap: 10px;

  &__avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }

  &__info {
    display: flex;
    flex-direction: column;
  }

  &__name {
    font-weight: bold;
  }

  &__alias {
    color: gray;
  }
}
</style>